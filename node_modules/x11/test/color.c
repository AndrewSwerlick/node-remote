static char rcsid [] =
        "$Header: /u/04c/mnt/integ/tools/src/RCS/color.c,v 1.2 89/09/05 13:48:03 little Exp $";

/*
$Log:	color.c,v $
 * Revision 1.2  89/09/05  13:48:03  little
 * this came from steve, not sure what he changed
 * 
*/


#include "snap.h"


/*--------------------------------------------------------------------------*\
|
|   Distribution: Approved for public release; distribution is unlimited.
|
|   Copyright (c) 1989  by  Carnegie  Mellon  University, Pittsburgh, PA.  The
|  Software Engineering  Institute  (SEI) is a federally  funded  research and
|  development center established  and  operated by Carnegie Mellon University
|  (CMU).  Sponsored  by  the  U.S.  Department  of   Defense  under  contract
|  F19628-85-C-0003,  the  SEI  is  supported  by  the  services  and  defense
|  agencies, with the U.S. Air Force as the executive contracting agent.
|
|    Permission to use,  copy,  modify, or  distribute  this  software and its
|  documentation for  any purpose and without fee  is hereby granted, provided
|  that  the above copyright notice appear  in  all copies and that both  that
|  copyright  notice  and   this  permission  notice  appear   in   supporting
|  documentation.   Further,  the  names  Software  Engineering  Institute  or
|  Carnegie  Mellon  University  may  not be used in  advertising or publicity
|  pertaining to distribution of the software without specific, written  prior
|  permission.  CMU makes no claims  or representations  about the suitability
|  of this software for any purpose.  This software is provided "as is" and no
|  warranty,  express  or  implied,  is  made  by  the  SEI  or CMU, as to the
|  accuracy  and  functioning of the program and related program material, nor
|  shall   the  fact of  distribution   constitute  any   such  warranty.   No
|  responsibility is assumed by the SEI or CMU in connection herewith.
|
\*--------------------------------------------------------------------------*/


/*
 * Macros
 * 
 * The ROUNDUP macro rounds up a quantity to the specified boundary.
 *
 * The XYNORMALIZE macro determines whether XY format data requires 
 * normalization and calls a routine to do so if needed. The logic in
 * this module is designed for LSBFirst byte and bit order, so 
 * normalization is done as required to present the data in this order.
 *
 * The ZNORMALIZE macro performs byte and nibble order normalization if 
 * required for Z format data.
 *
 * The XYINDEX macro computes the index to the starting byte (char) boundary
 * for a bitmap_unit containing a pixel with coordinates x and y for image
 * data in XY format.
 * 
 * The ZINDEX macro computes the index to the starting byte (char) boundary 
 * for a pixel with coordinates x and y for image data in ZPixmap format.
 * 
 */

#define ROUNDUP(nbytes, pad) ((((nbytes) + ((pad) - 1)) / (pad)) * (pad))

#define XYNORMALIZE(bp, nbytes, img) \
    if ((img->byte_order == MSBFirst) || (img->bitmap_bit_order == MSBFirst)) \
	_normalizeimagebits((unsigned char *)(bp), (nbytes), img->byte_order, img->bitmap_unit, \
	    img->bitmap_bit_order)

#define ZNORMALIZE(bp, nbytes, img) \
    if (img->byte_order == MSBFirst) \
	_normalizeimagebits((unsigned char *)(bp), (nbytes), MSBFirst, img->bits_per_pixel, \
	LSBFirst)

#define XYINDEX(x, y, img) \
    ((y) * img->bytes_per_line) + \
    (((x) + img->xoffset) / img->bitmap_unit) * (img->bitmap_unit >> 3)

#define ZINDEX(x, y, img) ((y) * img->bytes_per_line) + \
    (((x) * img->bits_per_pixel) >> 3)


extern unsigned char _reverse_byte[0x100]; /* found in XPutImage */
static char _lomask[0x09] = { 0x00, 0x01, 0x03, 0x07, 0x0f, 0x1f, 0x3f, 0x7f, 0xff };
static char _himask[0x09] = { 0xff, 0xfe, 0xfc, 0xf8, 0xf0, 0xe0, 0xc0, 0x80, 0x00 };

static _normalizeimagebits (bpt, nb, byteorder, unitsize, bitorder)
    unsigned char *bpt;	/* beginning pointer to image bits */
    int nb;		/* number of bytes to normalize */
    int byteorder;	/* swap bytes if byteorder == MSBFirst */
    int unitsize;	/* size of the bitmap_unit or Zpixel */
    int bitorder;	/* swap bits if bitorder == MSBFirst */
{
	if ((byteorder==MSBFirst) && (byteorder!=bitorder)) {
	    register char c;
	    register unsigned char *bp = bpt;
	    register unsigned char *ep = bpt + nb;
	    register unsigned char *sp;
	    switch (unitsize) {

		case 4:
		    do {			/* swap nibble */
			*bp = ((*bp >> 4) & 0xF) | ((*bp << 4) & ~0xF);
			bp++;
		    }
		    while (bp < ep);
		    break;

		case 16:
		    do {			/* swap short */
			c = *bp;
			*bp = *(bp + 1);
			bp++;
			*bp = c;
			bp++;
		    }
		    while (bp < ep);
		    break;

		case 24:
		    do {			/* swap three */
			c = *(bp + 2);
			*(bp + 2) = *bp;
			*bp = c;
			bp += 3;		
		    }
		    while (bp < ep);
		    break;

		case 32:
		    do {			/* swap long */
			sp = bp + 3;
			c = *sp;
			*sp = *bp;
			*bp++ = c;
			sp = bp + 1;
			c = *sp;
			*sp = *bp;
			*bp++ = c;
			bp += 2;
		    }
		    while (bp < ep);
		    break;
	    }
	}
	if (bitorder == MSBFirst) {
	    do {
		*bpt = _reverse_byte[*bpt];
		bpt++;
	    }
	    while (--nb > 0);
	}
}


static _putbits (src, dstoffset, numbits, dst)
    register char *src;	/* address of source bit string */
    long dstoffset;	/* bit offset into destination; range is 0-31 */
    register int numbits;/* number of bits to copy to destination */
    register char *dst;	/* address of destination bit string */
{
	register unsigned char chlo, chhi;
	int hibits;
	dst = dst + (dstoffset >> 3);
	dstoffset = dstoffset & 7;
	hibits = 8 - dstoffset;
	chlo = *dst & _lomask[dstoffset];
	for (;;) {
	    chhi = (*src << dstoffset) & _himask[dstoffset];
	    if (numbits <= hibits) {
		chhi = chhi & _lomask[dstoffset + numbits];
		*dst = (*dst & _himask[dstoffset + numbits]) | chlo | chhi;
		break;
	    }
	    *dst = chhi | chlo;
	    dst++;
	    numbits = numbits - hibits;
	    chlo = (unsigned char) (*src & _himask[hibits]) >> hibits;
	    src++;
	    if (numbits <= dstoffset) {
		chlo = chlo & _lomask[numbits];
		*dst = (*dst & _himask[numbits]) | chlo;
		break;
	    }
	    numbits = numbits - dstoffset;
	}	
}



unsigned long pixel_get(ximage, x, y)
register XImage *ximage;
int x, y;
{
  unsigned long pixel, px;
  register char *src, *dst;
  register int i;
  int bits, nbytes;
	src = &ximage->data[ZINDEX(x, y, ximage)];
	dst = (char *)&px;
	px = 0;
	nbytes = ROUNDUP(ximage->bits_per_pixel, 8) >> 3;
	for (i=0; i < nbytes; i++) *dst++ = *src++;		
	ZNORMALIZE(&px, nbytes, ximage);
	pixel = 0;
	for (i=sizeof(unsigned long); --i >= 0; )
	    pixel = (pixel << 8) | ((unsigned char *)&px)[i];
	if (ximage->bits_per_pixel == 4) {
	    if (x & 1)
		pixel >>= 4;
	    else
		pixel &= 0xf;
	}
	return pixel;
}


void pixel_put(ximage, x, y, pixel)
register XImage *ximage;
int x, y;
unsigned long pixel;
{
  unsigned long px;
  register char *src, *dst;
  register int i;
  int nbytes;

	src = &ximage->data[XYINDEX(x, y, ximage)];
	dst = (char *)&px;
	px = 0;
	nbytes = ximage->bitmap_unit >> 3;
	for (i=0; i < nbytes; i++) *dst++ = *src++;
	XYNORMALIZE(&px, nbytes, ximage);
	i = ((x + ximage->xoffset) % ximage->bitmap_unit);
	_putbits ((char *)&pixel, i, 1, (char *)&px);
	XYNORMALIZE(&px, nbytes, ximage);
	src = (char *) &px;
	dst = &ximage->data[XYINDEX(x, y, ximage)];
	for (i=0; i < nbytes; i++) *dst++ = *src++;
}

int b0[16] = {
	0, 1, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 1};
int b1[16] = {
	0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1};
int b2[16] = {
	0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1};
int b3[16] = {
	0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 1, 1, 1, 1};

XImage *transform(ximage1)
XImage *ximage1;
{
  register unsigned long pixel;
  register int x, y;
  XColor cl;
  int r, index;
  int line;
  double f;
  XImage *ximage2;
  char *data;
  int white = 1, black = 0;

  if (ximage1->bits_per_pixel == 4) {
    if (reverse) {
	white = 0;
	black = 1;
    }
    line = ROUNDUP(ximage1->width, ximage1->bitmap_pad) >> 3;
    data = (char *)malloc(line * ximage1->height);
    line = line << 3;
    if (debug > 2) {
	printf("oldwidth = %d, newwidth = %d\n", 
		ximage1->width, line);
    }
    ximage2 = XCreateImage(dpy, win_info.visual, 1, ZPixmap, 0,
		data, line, ximage1->height, 
		ximage1->bitmap_pad, 0);

    for (y = 0; y < ximage1->height; y++)
      for (x = 0; x < line; x++) {
	if (x < ximage1->width) {
		pixel = pixel_get(ximage1, 2*x, 2*y);
		if (debug > 2)
			printf("=> (%d,%d): pixel = %d\n", x, y, pixel);
		if (pixel == XWhitePixel(dpy, 0)) index = white;
		else index = black;
		pixel_put(ximage2, x, y, index);
	}
	else
		pixel_put(ximage2, x, y, white);
    }
  }
  else {
    line = ROUNDUP(ximage1->width * 2, ximage1->bitmap_pad) >> 3;
    data = (char *)malloc(line * ximage1->height * 2);
    line = line << 3;
    if (debug > 2) {
	printf("oldwidth = %d, newwidth = %d\n", 
		ximage1->width, line);
    }
    ximage2 = XCreateImage(dpy, win_info.visual, 1, ZPixmap, 0,
		data, line, ximage1->height * 2, 
		ximage1->bitmap_pad, 0);
    line = line >> 1;

    for (y = 0; y < ximage1->height; y++)
      for (x = 0; x < line; x++) {
	if (x < ximage1->width) {
	pixel = pixel_get(ximage1, x, y);
	if (debug > 2)
		printf("=> (%d,%d): pixel = %d", x, y, pixel);
	if (pixel == XWhitePixel(dpy, 0)) index = 15;
	else if (pixel == XBlackPixel(dpy, 0)) index = 0;
	else {
	  cl = color[pixel];
	  f = (0.3 * cl.red) + (0.59 * cl.green) + (0.11 * cl.blue);
	  if (debug > 2)
		printf("	& intensity = %f\n", f);
	  r = f;
	  index = r >> 12;
	}
	pixel_put(ximage2, 2*x, 2*y, b0[index]);
	pixel_put(ximage2, 2*x+1, 2*y, b1[index]);
	pixel_put(ximage2, 2*x, 2*y+1, b2[index]);
	pixel_put(ximage2, 2*x+1, 2*y+1, b3[index]);
	}
	else {
	pixel_put(ximage2, 2*x, 2*y, 15);
	pixel_put(ximage2, 2*x+1, 2*y, 15);
	pixel_put(ximage2, 2*x, 2*y+1, 15);
	pixel_put(ximage2, 2*x+1, 2*y+1, 15);
	}

      }
  }
  return ximage2;
}


XImage *bit1_reverse(image1)
XImage *image1;
{
	register unsigned int *rev = (unsigned int *)image1->data;
	register int i, j;
	int lim = image1->bytes_per_line >> 2;

	for (i= 0; i < image1->height; i++)
		for (j = 0; j < lim; j++) {
			*rev = ~(*rev);
			rev++;
		}
	return image1;
}


void imagedump(ximage)
XImage *ximage;
{
  register int x, y;
  register unsigned long pixel;

  for (y = 0; y < ximage->height; y++)
	for (x = 0; x < ximage->width; x++) {
		pixel = XGetPixel(ximage, x, y);
		printf("=> (%d,%d): pixel = %d\n", x, y, pixel); 
	}
}

void datadump(ximage)
XImage *ximage;
{
  register int i, j, limit, ret;
  register char *data;
  
  limit = ximage->bytes_per_line * ximage->height;
  ret = ximage->width / 8;
  j = 0;
  data = (char *)ximage->data;
  for (i = 0; i < limit; i++) {
	printf("%h", (unsigned long)(*data));
	++j;
	if (j >= ret) {
		printf("\n");
		j = 0;
	}
	++data;
  }
}

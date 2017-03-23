'use strict';

// A wheel-of-fortune spinner component.
//
// +----------------------------------------------------------------+
// | (c)2017 Allen Holub. All rights reserved (http://holub.com).   |
// |                                                                |
// | This code is licensed according to the "Free BSD" license as   |
// | follows:                                                       |
// |                                                                |
// | Redistribution and use in source and binary forms, with or     |
// | without modification, are permitted provided that the          |
// | following Conditions are met:                                  |
// |                                                                |
// | 1. Redistributions of source code must retain the above        |
// |    copyright notice AND URL, this list of conditions and the   |
// |    following disclaimer.                                       |
// |                                                                |
// | 2. Redistributions in binary form must reproduce the above     |
// |    copyright notice, this list of conditions and the           |
// |    following disclaimer in the documentation and/or            |
// |    other materials provided with the distribution.             |
// |                                                                |
// | THIS SOFTWARE IS PROVIDED BY ALLEN HOLUB "AS IS," AND          |
// | ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT          |
// | LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY          |
// | AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.           |
// | IN NO EVENT SHALL ALLEN HOLUB BE LIABLE FOR ANY                |
// | DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR           |
// | CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,          |
// | PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF           |
// | USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)               |
// | HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER         |
// | IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING              |
// | NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE         |
// | USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE                   |
// | POSSIBILITY OF SUCH DAMAGE.                                    |
// +----------------------------------------------------------------+
//
// JQuery is required. Put the following above the script element that calls in
// the current code:
//
// 		<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.1.1/jquery.min.js">
// 		</script>
//
// Find an example in Spinner.html
//
// CSS Classes:
//
//	ah-spinner			All divs that specify this class are treated as spinners.
//						The following attributes on the div are recognized:
//
//			 			img="img/reverseCompassRose.png" // image to spin
//			 			onComplete="spinner2Complete"	 // Call on spin complete.
//			 											 // Passed a single argument
//			 											 // holding	the integer
//			 											 // offset from 0 degrees.
//
//  ah-spinner-img		Spinner img element.
//	ah-spinner-pointer	Div that holds the pointer. 
//						Use .ah-spinner-pointer span {} to style the arrowhead
//
//
// Constructor throws: Error if no image is specified either here or in target div
//
//======================================================================

function Spinner( targetDiv,	// If a string, is the  of the div that holds the
								// 		spinner (without the #). Can also be a
								// 		JQuery Element.	The div width controls the
								// 		width of the spinner: the image is scaled
								// 		to fit.
				  imageURL,		// url of the image (optional if img="" specified
								// in target Div, which takes precedence).
				  onComplete    // Optional spin-completed callback:
								// 		onComplete(offsetFrom0deg)
){
	function getRandomIntBetween(min, max) {
		return Math.floor(Math.random() * (max - min + 1)) + min ; 
	}

	var deg = 0;

	// If it's not a jQuery object, turn it into one
	//
	if( !(targetDiv instanceof jQuery) )
		targetDiv = $("#" + targetDiv);

	var pointerDiv = $('<div />', {
		"class" : "ah-spinner-pointer",
		"css" : { "text-align" : "center" }
	}).appendTo( targetDiv );

	$('<span > &#9660; </span>').appendTo( pointerDiv );

	// There is a second argument and it's the callback
	// rather than an image
	//
	if( imageURL && jQuery.isFunction(imageURL) ){
		onComplete = imageURL;
		imageURL   = null;
	}

	// If there was a img tag in the div, then use it;
	// otherwise, use the one that was passed into this
	// method.
	//
	var imageURLInDiv = targetDiv.attr("img");
	if( imageURLInDiv ) {
		imageURL = imageURLInDiv;
	}

	if( !imageURL )
		throw new Error("No image specified for Spinner)");

	var imgElement = $('<img />', {
		"class" : "ah-spinner-img",
		"css"   : {
    				"-webkit-transition" : "-webkit-transform 3s cubic-bezier(.3,.2,.02,.99)",
    				"transition"         : "transform 3s cubic-bezier(.3,.2,.02,.99)",
					"width" : "100%"
			      },
		"src"   : imageURL,
		"click" : function() {
					var newPosition = getRandomIntBetween(0, 360) ;

					deg = ( deg > 720 )			// Make sure it spins one or more times
						? newPosition
						: newPosition + 720
						;

					imgElement.removeAttr('-webkit-transform');
					imgElement.css       ('-webkit-transform', 'rotate(' + deg + 'deg)' );
					imgElement.removeAttr('transform');
					imgElement.css       ('transform', 'rotate(' + deg + 'deg)' );
				  }
	}).appendTo( targetDiv );

	imgElement.on( 'webkitTransitionEnd otransitionend'
									+ ' oTransitionEnd msTransitionEnd transitionend',
					function(e) {
						if( onComplete )
							onComplete( deg % 360 );
					} );
}


/** Figure out the segment of the wheel corresponding to the rotation in degrees
  * The wheel is assumed to have a segment boundary at 12 o'clock, and for
  * equally-spaced segments to be number clockwise, starting at the one to the
  * right of the line at 12 o'clock. This is a 'static' method, in the sense
  * that you don't need a Spinner object around to call it. Just use:
  * 		Spinner.getSegment(...)
  */
Spinner.getSegment = 
	function( rotationInDegrees,// as is passed to onComplete function
			  numberOfSegments,	// number of divisions on wheel
			  repeat ) 		    // times the number repeats. For example,
								// the wheel could have 6 segments
								// labeled 1,2,3,1,2,3. The
								// numberOfSegments is 6 and the repeat is 1
								// If there's no repetition, specify 0;
{
	 rotationInDegrees = 360 - (rotationInDegrees % 360);
	 var numberOfSegments = 14;
	 var maxCount		  = numberOfSegments / (repeat + 1)
	 var wedge			  = 360/numberOfSegments;
	 return ( Math.floor(rotationInDegrees / wedge) % maxCount) + 1;
}

/** On load, search the page for divs marked with the ah-spinner class
 *  and turn them into spinners.
 */
$( function() {
	$(".ah-spinner").each( function(index, element) {

		// Attributes are strings, which in this case
		// holds a function name. Call the function
		// using eval (and add an argument); Bear in mind
		// That the eval method is called when the
		// function is called, not here.
		//
		var callbackName = $(element).attr("onComplete");

		new Spinner (
			$(element),
			$(element).attr("img"),
			function(position) {
				eval( callbackName + "(position);" )
			}
		);
	});
})

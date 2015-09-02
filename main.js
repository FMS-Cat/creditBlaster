var beginTime = ( +new Date() );
var frame = 0;

var credit = 'F';
if( location.href.split( '#' )[1] ){
	credit = location.href.split( '#' )[1];
}else{
	alert( 'http://fms-cat.github.io/creditBlaster/#<爆破したい履修単位名>' );
}

var canvas = document.createElement( 'canvas' );
var width = window.innerWidth / 2.0;
var height = window.innerHeight / 2.0;
canvas.width = width;
canvas.height = height;
canvas.style.width = window.innerWidth + 'px';
canvas.style.height = window.innerHeight + 'px';

var particleCount = 256;

var gl = canvas.getContext( 'webgl' );
var floatExtension = gl.getExtension( 'OES_texture_float' );
document.body.appendChild( canvas );

gl.enable( gl.DEPTH_TEST );
gl.depthFunc( gl.LEQUAL );
gl.enable( gl.BLEND );

// ----------

var createProgram = function( _vert, _frag ){
	var vert = gl.createShader( gl.VERTEX_SHADER );
	gl.shaderSource( vert, _vert );
	gl.compileShader( vert );
	if( !gl.getShaderParameter( vert, gl.COMPILE_STATUS ) ){
		alert( gl.getShaderInfoLog( vert ) );
		return null;
	}

	var frag = gl.createShader( gl.FRAGMENT_SHADER );
	gl.shaderSource( frag, _frag );
	gl.compileShader( frag );
	if(!gl.getShaderParameter( frag, gl.COMPILE_STATUS ) ){
		alert( gl.getShaderInfoLog( frag ) );
		return null;
	}

	var program = gl.createProgram();
	gl.attachShader( program, vert );
	gl.attachShader( program, frag );
	gl.linkProgram( program );
	if( gl.getProgramParameter( program, gl.LINK_STATUS ) ){
    program.locations = {};
		return program;
	}else{
		alert( gl.getProgramInfoLog( program ) );
		return null;
	}
};

var createVertexbuffer = function( _array ){
  var buffer = gl.createBuffer();

  gl.bindBuffer( gl.ARRAY_BUFFER, buffer );
  gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( _array ), gl.STATIC_DRAW );
  gl.bindBuffer( gl.ARRAY_BUFFER, null );

  buffer.length = _array.length;
  return buffer;
}

var createIndexbuffer = function( _array ){
  var buffer = gl.createBuffer();

  gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, buffer );
  gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, new Int16Array( _array ), gl.STATIC_DRAW );
  gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, null );

  buffer.length = _array.length;
  return buffer;
}

var attribute = function( _program, _name, _buffer, _stride ){
  var location;
  if( _program.locations[ _name ] ){
    location = _program.locations[ _name ];
  }else{
    location = gl.getAttribLocation( _program, _name );
    _program.locations[ _name ] = location;
  }

  gl.bindBuffer( gl.ARRAY_BUFFER, _buffer );
  gl.enableVertexAttribArray( location );
  gl.vertexAttribPointer( location, _stride, gl.FLOAT, false, 0, 0 );

  gl.bindBuffer( gl.ARRAY_BUFFER, null );
};

var getUniformLocation = function( _program, _name ){
  var location;

  if( _program.locations[ _name ] ){
		location = _program.locations[ _name ];
	}else{
		location = gl.getUniformLocation( _program, _name );
		_program.locations[ _name ] = location;
	}

  return location;
};

var uniform1i = function( _program, _name, _value ){
	var location = getUniformLocation( _program, _name );

	gl.uniform1i( location, _value );
};

var uniform1f = function( _program, _name, _value ){
	var location = getUniformLocation( _program, _name );

	gl.uniform1f( location, _value );
};

var uniform2fv = function( _program, _name, _value ){
	var location = getUniformLocation( _program, _name );

	gl.uniform2fv( location, _value );
};

var uniform3fv = function( _program, _name, _value ){
	var location = getUniformLocation( _program, _name );

	gl.uniform3fv( location, _value );
};

var uniformTexture = function( _program, _name, _texture, _number ){
	var location = getUniformLocation( _program, _name );

  gl.activeTexture( gl.TEXTURE0 + _number );
  gl.bindTexture( gl.TEXTURE_2D, _texture );
  gl.uniform1i( location, _number );
};

var createTexture = function(){
	var texture = gl.createTexture();
	gl.bindTexture( gl.TEXTURE_2D, texture );
  gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
  gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST );
  gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE );
  gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE );
	gl.bindTexture( gl.TEXTURE_2D, null );

	return texture;
};

var setTexture = function( _texture, _image ){
	gl.bindTexture( gl.TEXTURE_2D, _texture );
	gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, _image );
	gl.bindTexture( gl.TEXTURE_2D, null );
};

var setTextureFromArray = function( _texture, _width, _height, _array ){
	gl.bindTexture( gl.TEXTURE_2D, _texture );
	gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, _width, _height, 0, gl.RGBA, gl.FLOAT, new Float32Array( _array ) );
	gl.bindTexture( gl.TEXTURE_2D, null );
};

var createFramebuffer = function( _width, _height ){
  var framebuffer = gl.createFramebuffer();
  gl.bindFramebuffer( gl.FRAMEBUFFER, framebuffer );

  framebuffer.texture = gl.createTexture();
  gl.bindTexture( gl.TEXTURE_2D, framebuffer.texture );
  gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, _width, _height, 0, gl.RGBA, gl.FLOAT, null );
  gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
  gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST );
  gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE );
  gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE );
  gl.framebufferTexture2D( gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, framebuffer.texture, 0 );

  gl.bindTexture( gl.TEXTURE_2D, null );
  gl.bindFramebuffer( gl.FRAMEBUFFER, null );

  return framebuffer;
};

// ----------

// vbos
var quadVBO;
var uvVBO;

// shader codes
var quadVert;
var blurFrag;
var particleFrag;
var returnFrag;
var renderVert;
var renderFrag;
var postFrag;

// shader programs
var blurProgram;
var particleProgram;
var returnProgram;
var renderProgram;
var postProgram;

// texture
var initialTexture;

// framebuffers
var particleFramebuffer;
var returnFramebuffer;
var renderFramebuffer;
var postFramebuffer;
var backFramebuffer;

// ----------

// params
var params = {}

params.blastBeginTime = beginTime + 1000;
params.cameraPos = [ 0.0, 0.0, 4.0 ];
params.cameraPosAni = [ 0.0, 0.0, 10.0 ];
params.pattern = 0.0;
params.paramDir = [ 0.0, 0.0, 0.0 ];
params.rainbow = false;

window.onmousedown = function(){
	params.blastBeginTime = ( +new Date() ) + 300;

	params.pattern = 1.0 - params.pattern;
	params.rainbow = Math.random() < 0.01 ? true : false;

	if( true ){
		var x = Math.random() * 1.4 - 0.7;
		var y = Math.random() * 1.4 - 0.7;
		var z = Math.sqrt( 1.0 - ( x*x + y*y ) );
		params.cameraPos = [ x * 4.0, y * 4.0, z * 4.0 ];
	}

	if( true ){
		var x = Math.random() * 2.0 - 1.0;
		var y = Math.random() * 2.0 - 1.0;
		var z = Math.random() * 2.0 - 1.0;
		params.paramDir = [ x, y, z ];
	}
}

// ----------

var ready = function(){
	if( typeof this.count !== 'number' ){ this.count = 0; }
	this.count ++;
	if( this.count === 6 ){ go(); }
}

var go = function(){
	if( typeof this.count !== 'number' ){ this.count = 0; }
	else{ this.count ++; }

	if( this.count === 0 ){
		quadVert = 'attribute vec3 position; void main(){ gl_Position = vec4( position, 1.0 ); }';

		requestText( 'blur.frag', function( _text ){
			blurFrag = _text;
			go();
		} );

		requestText( 'particle.frag', function( _text ){
			particleFrag = _text;
			go();
		} );

		requestText( 'return.frag', function( _text ){
			returnFrag = _text;
			go();
		} );

		requestText( 'render.vert', function( _text ){
			renderVert = _text;
			go();
		} );

		requestText( 'render.frag', function( _text ){
			renderFrag = _text;
			go();
		} );

		requestText( 'post.frag', function( _text ){
			postFrag = _text;
			go();
		} );
	}

	if( this.count === 6 ){
		quadVBO = createVertexbuffer( [-1,-1,0,1,-1,0,1,1,0,-1,-1,0,1,1,0,-1,1,0] );
		uvVBO = createVertexbuffer( ( function(){
			var a = [];
			for( var iy=0; iy<particleCount; iy++ ){
				for( var ix=0; ix<particleCount; ix++ ){
					a.push( ix );
					a.push( iy );
				}
			}
			return a;
		} )() );

		particleProgram = createProgram( quadVert, particleFrag );
		returnProgram = createProgram( quadVert, returnFrag );
		renderProgram = createProgram( renderVert, renderFrag );
		postProgram = createProgram( quadVert, postFrag );

		particleFramebuffer = createFramebuffer( particleCount * 4, particleCount );
		returnFramebuffer = createFramebuffer( particleCount * 4, particleCount );
		renderFramebuffer = createFramebuffer( width, height );
		postFramebuffer = createFramebuffer( width, height );
		backFramebuffer = createFramebuffer( width, height );

		initialTexture = createTexture( particleCount * 4, particleCount );
		setTextureFromArray( initialTexture, particleCount * 4, particleCount, ( function(){
			var canvas = document.createElement( 'canvas' );
			var width = 1024;
			var height = 256;
			canvas.width = width;
			canvas.height = height;
			canvas.context = canvas.getContext( '2d' );

			canvas.context.textAlign = 'center';
			canvas.context.textBaseline = 'middle';
			canvas.context.translate( width / 2, height / 2 );

			canvas.context.font = '800 256px/1.0 "ヒラギノ角ゴ StdN" sans-serif'
			var w = canvas.context.measureText( credit ).width;
			if( width < w ){
				canvas.context.scale( width / w, width / w );
			}

			canvas.context.fillStyle = '#ffffff';
			canvas.context.fillText( credit, 0, 0 );

			var imageData = canvas.context.getImageData( 0, 0, width, height );

			var a = [];
			for( var i=0; i<particleCount*particleCount; i++ ){
				var x = 0;
				var y = 0;
				for( var ii=0; ii<100; ii++ ){
					x = Math.floor( Math.random() * width );
					y = Math.floor( Math.random() * height );
					if( 127 < imageData.data[ ( x + y * width ) * 4 ] ){
						break;
					}
				}

				a.push( ( x - width / 2 ) * 0.005  );
				a.push( ( height / 2 - y ) * 0.005 );
				a.push( Math.random() * 0.1 - 0.05 );
				a.push( Math.random() );

				a.push( Math.random() - 0.5 );
				a.push( Math.random() - 0.5 );
				a.push( Math.random() - 0.5 );
				a.push( Math.random() );

				a.push( Math.random() );
				a.push( Math.random() );
				a.push( Math.random() );
				a.push( Math.random() );

				a.push( Math.random() );
				a.push( Math.random() );
				a.push( Math.random() );
				a.push( Math.random() );
			}
			return a;
		} )() );

		// ----------

		var update = function(){
			var time = ( ( +new Date() ) - beginTime ) * 0.001;
			var blastTime = ( ( +new Date() ) - params.blastBeginTime ) * 0.001;
			frame ++;

			for( var i=0; i<3; i++ ){
				params.cameraPosAni[ i ] += ( params.cameraPos[ i ] - params.cameraPosAni[ i ] ) * 0.2;
			}

			// ----------

			// particle
			( function(){
				gl.useProgram( particleProgram );
			  gl.bindFramebuffer( gl.FRAMEBUFFER, particleFramebuffer );
				gl.viewport( 0, 0, particleCount * 4.0, particleCount );
				gl.blendFunc( gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA );

			  gl.clearColor( 0.0, 0.0, 0.0, 1.0 );
			  gl.clearDepth( 1.0 );
			  gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

				attribute( particleProgram, 'position', quadVBO, 3 );

				uniform1f( particleProgram, 'time', time );
				uniform1f( particleProgram, 'blastTime', blastTime );
				uniform1f( particleProgram, 'frame', frame );
				uniform1f( particleProgram, 'particleCount', particleCount );

				uniform1f( particleProgram, 'pattern', params.pattern );
				uniform3fv( particleProgram, 'paramDir', params.paramDir );

		  	uniformTexture( particleProgram, 'particleTexture', returnFramebuffer.texture, 0 );
				uniformTexture( particleProgram, 'initialTexture', initialTexture, 1 );

			  gl.drawArrays( gl.TRIANGLES, 0, quadVBO.length / 3 );
			} )();

			// return
			( function(){
				gl.useProgram( returnProgram );
				gl.bindFramebuffer( gl.FRAMEBUFFER, returnFramebuffer );
				gl.viewport( 0, 0, particleCount * 4.0, particleCount );
				gl.blendFunc( gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA );

				gl.clearColor( 0.0, 0.0, 0.0, 1.0 );
				gl.clearDepth( 1.0 );
				gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

				attribute( returnProgram, 'position', quadVBO, 3 );

				uniform2fv( returnProgram, 'resolution', [ particleCount*4, particleCount ] );
				uniformTexture( returnProgram, 'texture', particleFramebuffer.texture, 0 );

				gl.drawArrays( gl.TRIANGLES, 0, quadVBO.length / 3 );
			} )();

			// render
			( function(){
				gl.useProgram( renderProgram );
			  gl.bindFramebuffer( gl.FRAMEBUFFER, renderFramebuffer );
				gl.viewport( 0, 0, width, height );
				gl.blendFunc( gl.SRC_ALPHA, gl.ONE );

			  gl.clearColor( 0.0, 0.0, 0.0, 1.0 );
			  gl.clearDepth( 1.0 );
			  gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

				attribute( renderProgram, 'uv', uvVBO, 2 );

				uniform1f( renderProgram, 'time', time );
				uniform2fv( renderProgram, 'resolution', [ width, height ] );
				uniform1f( renderProgram, 'particleCount', particleCount );
				uniform1i( renderProgram, 'rainbow', params.rainbow );

				uniform3fv( renderProgram, 'cameraPos', params.cameraPosAni );

				uniformTexture( renderProgram, 'particleTexture', particleFramebuffer.texture, 0 );

			  gl.drawArrays( gl.POINTS, 0, uvVBO.length / 2 );
				//gl.drawArrays( gl.LINES, 0, uvVBO.length / 2 );
			} )();

			// post
			( function(){
				gl.useProgram( postProgram );
				gl.bindFramebuffer( gl.FRAMEBUFFER, postFramebuffer );
				gl.viewport( 0, 0, width, height );
				gl.blendFunc( gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA );

				gl.clearColor( 0.0, 0.0, 0.0, 1.0 );
				gl.clearDepth( 1.0 );
				gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

				attribute( postProgram, 'position', quadVBO, 3 );

				uniform2fv( postProgram, 'resolution', [ width, height ] );
				uniformTexture( postProgram, 'renderTexture', renderFramebuffer.texture, 0 );
				uniformTexture( postProgram, 'backbuffer', backFramebuffer.texture, 1 );

				gl.drawArrays( gl.TRIANGLES, 0, quadVBO.length / 3 );
			} )();

			// back
			( function(){
				gl.useProgram( returnProgram );
				gl.bindFramebuffer( gl.FRAMEBUFFER, backFramebuffer );
				gl.viewport( 0, 0, width, height );
				gl.blendFunc( gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA );

				gl.clearColor( 0.0, 0.0, 0.0, 1.0 );
				gl.clearDepth( 1.0 );
				gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

				attribute( returnProgram, 'position', quadVBO, 3 );

				uniform2fv( returnProgram, 'resolution', [ width, height ] );
				uniformTexture( returnProgram, 'texture', postFramebuffer.texture, 0 );

				gl.drawArrays( gl.TRIANGLES, 0, quadVBO.length / 3 );

				gl.bindFramebuffer( gl.FRAMEBUFFER, null );
				gl.drawArrays( gl.TRIANGLES, 0, quadVBO.length / 3 );
			} )();

		  gl.flush();

		  requestAnimationFrame( update );
		};
		requestAnimationFrame( update );
	}
};
go();

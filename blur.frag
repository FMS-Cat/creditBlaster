#ifdef GL_ES
precision mediump float;
#endif

#define PI 3.14159265
#define SAMPLES 40.0

varying vec3 vLife;

uniform bool isV;
uniform vec2 resolution;
uniform sampler2D texture;

#define saturate(i) clamp(i,0.,1.)

float rgb2gray( vec3 _i ){
  return _i.x * 0.299 + _i.y * 0.587 + _i.z * 0.114;
}

float rgb2gray( vec4 _i ){
  return rgb2gray( _i.xyz );
}

float gaussian( float _x, float _v ){
  // Ref : https://www.google.co.jp/search?q=wikipedia+gaussian&oq=wikipedia+gau&aqs=chrome.1.69i57j0l5&sourceid=chrome&es_sm=91&ie=UTF-8
  return 1.0 / sqrt( 2.0 * PI * _v ) * exp( - _x * _x / 2.0 / _v );
}

void main(){
  vec3 col = vec3( 0.0 );
  vec2 gap = vec2( 1.0, 0.0 );
  if( isV ){ gap = vec2( 0.0, 1.0 ); }
  vec2 uv = gl_FragCoord.xy / resolution;
  if( !isV ){ uv = vec2( 0.0, 1.0 ) + vec2( 1.0, -1.0 ) * uv; }

  for( float i=-SAMPLES; i<=SAMPLES; i+=1.0 ){
    vec2 texCoord = uv + gap * i / resolution;
    float multiplier = gaussian( i, exp( 4.0 ) );
    col += texture2D( texture, texCoord ).xyz * multiplier;
  }

  gl_FragColor = vec4( vec3( rgb2gray( col ) ), 1.0 );
}

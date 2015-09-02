#ifdef GL_ES
precision mediump float;
#endif

varying vec3 vLife;
varying vec3 vCol;
varying float vTime;

uniform sampler2D particleTexture;
uniform bool rainbow;

#define saturate(i) clamp(i,0.,1.)

vec3 catColor( float _theta ){
  return vec3(
    sin( _theta ),
    sin( _theta + 2.0 ),
    sin( _theta + 4.0 )
  ) * 0.5 + 0.5;
}

void main(){
  vec2 uv = gl_PointCoord.xy;
  float shape = saturate( exp( -length( uv - 0.5 ) * 10.0 ) * 10.0 );
  vec3 color = vec3( 0.2 );
  if( rainbow ){ color *= catColor( vCol.x * 4.0 - vTime * 10.0 ); }
  gl_FragColor = vec4( vec3( shape ) * color, 1.0 );
}

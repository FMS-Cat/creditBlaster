#ifdef GL_ES
precision mediump float;
#endif

#define PI 3.14159265

uniform float time;
uniform vec2 resolution;
uniform sampler2D renderTexture;
uniform sampler2D backbuffer;

#define saturate(i) clamp(i,0.,1.)

void main(){
  vec2 uv = gl_FragCoord.xy / resolution;
  vec4 tex = texture2D( renderTexture, uv );
  vec3 sum = tex.xyz;
  for( float i=0.0; i<PI*1.99; i+=PI/4.0 ){
    sum += texture2D( backbuffer, uv + vec2( cos( i ), sin( i ) ) * 0.003 ).xyz * 0.05;
  }
  gl_FragColor = vec4( sum * 1.0, 1.0 );
}

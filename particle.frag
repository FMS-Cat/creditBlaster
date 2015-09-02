precision mediump float;

uniform float time;
uniform float frame;
uniform float particleCount;
uniform float blastTime;
uniform float pattern;
uniform vec3 paramDir;

uniform sampler2D particleTexture;
uniform sampler2D initialTexture;

#define saturate(i) clamp(i,0.,1.)
#define round(i) floor(i+0.5)

float hash( vec2 _v ){
  return fract( sin( dot( vec3( _v, sin( mod( time, 30.0 ) * 18775.24 ) ), vec3( 1617.295, 1282.446, 9876.54 ) ) ) * 17285.998 );
}

mat2 rotate( float _t ){
  return mat2( cos( _t ), sin( _t ), -sin( _t ), cos( _t ) );
}

void main(){
vec2 reso = vec2( 4.0, 1.0 ) * particleCount;
  vec2 uv = gl_FragCoord.xy / reso;

  float type = mod( floor( gl_FragCoord.x ), 4.0 );

  vec2 posP = uv + vec2( 0.0 - type, 0.0 ) / reso;
  vec2 velP = uv + vec2( 1.0 - type, 0.0 ) / reso;
  vec2 lifeP = uv + vec2( 2.0 - type, 0.0 ) / reso;
  vec2 nouseP = uv + vec2( 3.0 - type, 0.0 ) / reso;

  vec3 ret = vec3( 0.0 );

  if( blastTime < 0.0 ){
    ret = texture2D( initialTexture, uv ).xyz;

    if( type == 0.0 ){
      vec3 iPos = ret;
      ret = texture2D( particleTexture, uv ).xyz;
      ret += ( iPos - ret ) * 0.5;
    }else if( type == 1.0 ){
      vec3 pos = texture2D( initialTexture, posP ).xyz;
      if( pattern == 0.0 ){
        vec3 p = pos - paramDir * vec3( 1.0, 0.1, 0.0 );
        ret = ( ret + p ) * 0.1;
        ret *= 1.0 / length( p );
      }else if( pattern == 1.0 ){
        ret = vec3( 0.0 );
      }
    }else if( type == 2.0 ){
      ret.x = 1.0;
    }else{
      vec3 pos = texture2D( initialTexture, posP ).xyz;
      ret.x = length( pos );
    }
  }else{
    ret = texture2D( particleTexture, uv ).xyz;

    if( type == 0.0 ){
      vec3 vel = texture2D( particleTexture, velP ).xyz;
      ret += vel * 1.0;
    }else if( type == 1.0 ){
      ret *= 0.97;
      vec3 pos = texture2D( particleTexture, posP ).xyz;
      vec3 life = texture2D( particleTexture, lifeP ).xyz - 0.5;
      if( pattern == 1.0 ){
        vec3 d = normalize( paramDir * vec3( 1.0, 0.1, 0.0 ) );
        vec3 v = pos - d * ( blastTime * 45.0 - 4.0 );
        ret += exp( -length( v.yz ) * 3.0 ) * exp( -length( v.x ) * 1.0 ) * ( v + life * 0.7 ) * 0.2;
      }
    }else if( type == 2.0 ){
    }else{
    }
  }

  gl_FragColor = vec4( ret, 1.0 );
}

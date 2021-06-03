export var shader: string = `
// Created by inigo quilez - iq/2013
// License Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License.


// See here for more information on smooth iteration count:
//
// http://iquilezles.org/www/articles/mset_smooth/mset_smooth.htm


// increase this if you have a very fast GPU
#define AA 2




float mandelbrot( in vec2 c )
{
    
        float c2 = dot(c, c);
        // skip computation inside M1 - http://iquilezles.org/www/articles/mset_1bulb/mset1bulb.htm
        if( 256.0*c2*c2 - 96.0*c2 + 32.0*c.x - 3.0 < 0.0 ) return 0.0;
        // skip computation inside M2 - http://iquilezles.org/www/articles/mset_2bulb/mset2bulb.htm
        if( 16.0*(c2+2.0*c.x+1.0) - 1.0 < 0.0 ) return 0.0;
    


    const float B = 256.0;
    float l = 0.0;
    vec2 z  = vec2(0.0);
    for( int i=0; i<512; i++ )
    {
        z = vec2( z.x*z.x - z.y*z.y, 2.0*z.x*z.y ) + c;
        if( dot(z,z)>(B*B) ) break;
        l += 1.0;
    }

    if( l>511.0 ) return 0.0;
    
    // ------------------------------------------------------
    // smooth interation count
    //float sl = l - log(log(length(z))/log(B))/log(2.0);

    // equivalent optimized smooth interation count
    float sl = l - log2(log2(dot(z,z))) + 4.0;

    float al = smoothstep( -0.1, 0.0, sin(0.5*6.2831*iTime ) );
    l = mix( l, sl, al );

    return l;
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    vec3 col = vec3(0.0);
    
    for( int m=0; m<AA; m++ ) {
    for( int n=0; n<AA; n++ )
    {
        vec2 p = (-iResolution.xy + 2.0*(fragCoord.xy+vec2(float(m),float(n))/float(AA)))/iResolution.y;
        float w = float(AA*m+n);
        float time = iTime + 0.5*(1.0/24.0)*w/float(AA*AA);    
        float zoo = 0.62 + 0.38*cos(.07*time);
        float coa = cos( 0.15*(1.0-zoo)*time );
        float sia = sin( 0.15*(1.0-zoo)*time );
        zoo = pow( zoo,8.0);
        vec2 xy = vec2( p.x*coa-p.y*sia, p.x*sia+p.y*coa);
        vec2 c = vec2(-.745,.186) + xy*zoo;

        float l = mandelbrot(c);

        col += 0.5 + 0.5*cos( 3.0 + l*0.15 + vec3(0.0,0.6,1.0));
    }
  }
    col /= float(AA*AA);

    fragColor = vec4( col, 1.0 );
}
`;

export var old_shader: string = `
precision highp float;
varying vec2 vTextureCoord;
uniform vec2 mouse;
uniform vec4 inputSize;
uniform vec4 outputFrame;
uniform float time;
uniform float juliaI;
// Complex number ADD operation
vec2 cadd(vec2 a, vec2 b) {
   return vec2(a.x+b.x, a.y+b.y);
}

// Complex number SUB operation
vec2 csub(vec2 a, vec2 b) {
   return vec2(a.x-b.x, a.y-b.y);
}

// Complex number MULT operation
vec2 cmult(vec2 a, vec2 b) {
   return vec2(
      a.x*b.x - a.y*b.y,
      a.x*b.y + a.y*b.x);
}

// Complex number MODULUS operation
float cmodulus(vec2 v) {
   return sqrt( v.x*v.x + v.y*v.y);
}

float _mod(float a, float b) {
  return a - (b * floor(a/b));
}
// Generate a julia fractal
const int iter = 120;
int c_julia(float x, float y) {
   vec2 cz = vec2(x, y);
   vec2 cc = vec2(0.32, juliaI);
   // vec2 cc = vec2(0.32, 0.505);
   // vec2 cc = vec2(0.35, 0.5);
   

   int n = 0;
   for (int n = 0; n < iter; n++) {
      cz = cmult(cz, cz);
      cz = cadd(cz, cc);
      if (cmodulus(cz) > 4.0) return n;
   }
   return 0;
}
void main() {
  float g = 6.0;
  float check = 0.5 * g;
  vec2 screenPos = vTextureCoord * inputSize.xy + outputFrame.xy;
  float x = (screenPos.x / 900.0) - 0.5;
  float y = (screenPos.y / 900.0) - 0.5;
  x *= 3.05;
  y *= 3.05;
  int result = c_julia(x, y);
  if (result > 30) {
     float fresult = float(result);
     gl_FragColor = vec4(fresult/90.0, 0.75/log(fresult), fresult/50.0, 0.5);
  } else {
     gl_FragColor = vec4(0.0, 0.0, 0.0, 0.5);
  }
  
  /*
  if (_mod(screenPos.x,  g) <= check || _mod(screenPos.y, g) <= check) {
    gl_FragColor = vec4(0, 0, 0, 0);
  } else {
    gl_FragColor = vec4(screenPos.x / 900.0, 0.4, 0.2, 0.5);
  }
  */
}
`;

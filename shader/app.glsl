// cosine based palette, 4 vec3 params
vec3 palette( in float t )
{
    vec3 a = vec3(0.5, 0.5, 0.5);
    vec3 b = vec3(0.5, 0.5, 0.5	);
    vec3 c = vec3(2.0, 1.0, 0.0);
    vec3 d = vec3(0.50, 0.20, 0.25);
    
    
    return a + b*cos( 6.28318*(c*t+d) );
}


void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    float a = 0.9;   // initial size fractal
    float b = 1.6;   // iterative size fractal
    float c = 50.0; // size of render in relation to length from center
    float d = 1.2;   // size of render 2
    float e = 5.0;
    float f = 0.04;  // brightness
    
    // Final color
    vec3 finalColor = vec3(0.0);
    // Center 0,0 and convert coordinates to -1 - 1
    vec2 uv =  fragCoord / iResolution.xy * 2.0 - 1.0;
    // Stretch x coordinates based on resolution
    uv.x *= iResolution.x/iResolution.y;

    // coordinates in relation to center
    vec2 uv0 = uv;
    
    uv = fract(uv*a)-0.5;
    for (float i = 0.; i < e; i++) {
        // Coordinates in relation to new centers
        uv = fract(uv*(b+i/e))-0.5;

        // length from center
        float len_l = length(uv);
        float len_c = length(uv0)*d;

        float len_l_c = len_l * exp(-len_c);

        // Base color
        vec3 col = palette(len_c+iTime/3.0)*i/8.;
        col.y = palette(len_l+iTime/5.0).y;
        col.z = palette(len_l+iTime/1.).z;

        // Make a sin function of d and time 
        float multiplier = sin(len_l_c *c+ iTime+ i/4.);
        multiplier = pow(f / abs(multiplier), 1.2);
        


        // Create output --------------------------
        finalColor += col * multiplier;
    }

    // Output to screen
    fragColor = vec4(finalColor ,1.0);
}
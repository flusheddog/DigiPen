/////////////////////////////////////////////////////////////////////////
// Pixel shader for lighting
////////////////////////////////////////////////////////////////////////
#version 330

out vec4 FragColor;

// These definitions agree with the ObjectIds enum in scene.h
const int     nullId	= 0;
const int     skyId	= 1;
const int     seaId	= 2;
const int     groundId	= 3;
const int     roomId	= 4;
const int     boxId	= 5;
const int     frameId	= 6;
const int     lPicId	= 7;
const int     rPicId	= 8;
const int     teapotId	= 9;
const int     spheresId	= 10;
const int     floorId	= 11;

in vec3 normalVec, lightVec, eyeVec, worldPos;
in vec2 texCoord;

uniform int objectId;

// Values describing the surface
uniform vec3 diffuse; // Kd
uniform vec3 specular; // Ks
uniform float shininess; // alpha exponent

// Values describing the scene's light
uniform vec3 light; // Ii
uniform vec3 ambient; // Ia


void main()
{
	vec3 N = normalize(normalVec);
	vec3 L = normalize(lightVec);
	vec3 V = normalize(eyeVec);
	vec3 H = normalize(L + V);
	vec3 Kd = diffuse;
	vec3 Ks = specular;
	vec3 Ii = light;
	vec3 Ia = ambient;
	float a = shininess;

	// A checkerboard pattern to break up large flat expanses.  Remove when using textures.
	if (objectId==groundId || objectId==floorId || objectId==seaId) {
		ivec2 uv = ivec2(floor(100.0*texCoord));
		if ((uv[0]+uv[1])%2==0)
			Kd *= 0.9; }
	
	// Lighting calculation
	float LN = max(dot(L,N),0.0);
	float HN = max(dot(H,N),0.0);
	float LH = max(dot(L,H),0.0);
	float NL = max(dot(N,L),0.0);
	
	// BRDF formula
	vec3 F = Ks + ((vec3(1,1,1) - Ks) * pow((1 - LH),5));
	float D = ((a + 2.0)/ (2.0 * 3.14159)) * pow(HN, a);
	vec3 BRDF = (Kd / 3.14159) + ((F * D) / (4 * LH * LH));

	gl_FragColor.xyz = (Ia * Kd) + (Ii * NL * BRDF);

	// FragColor.xyz = vec3(0.5,0.5,0.5)*Kd + Kd*max(dot(L,N),0.0);
}

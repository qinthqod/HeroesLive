shader_type canvas_item;

uniform float dimming : hint_range(0.0, 1.0) = 0.48;
uniform float saturation : hint_range(0.0, 1.5) = 0.72;
uniform float vignette_strength : hint_range(0.0, 1.0) = 0.72;
uniform float rain_strength : hint_range(0.0, 1.0) = 0.16;
uniform vec3 ink_tint : source_color = vec3(0.055, 0.12, 0.13);

float hash(vec2 p) {
	return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

void fragment() {
	vec4 source = texture(TEXTURE, UV);
	float luma = dot(source.rgb, vec3(0.299, 0.587, 0.114));
	vec3 graded = mix(vec3(luma), source.rgb, saturation);
	graded = mix(graded, graded * ink_tint * 2.4, dimming);

	vec2 centered = UV - vec2(0.5);
	float vignette = smoothstep(0.24, 0.78, length(centered * vec2(1.0, 0.78)));
	graded *= 1.0 - vignette * vignette_strength;

	vec2 rain_uv = vec2(UV.x * 180.0 + UV.y * 36.0, UV.y * 80.0 - TIME * 2.2);
	float rain_cell = hash(floor(rain_uv));
	float rain_line = step(0.972, rain_cell) * smoothstep(0.72, 0.0, fract(rain_uv.y));
	graded += vec3(0.48, 0.62, 0.63) * rain_line * rain_strength;

	COLOR = vec4(graded, source.a);
}

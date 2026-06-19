class_name QinglanVisuals
extends RefCounted

const INK := Color(0.010, 0.023, 0.026)
const LACQUER := Color(0.020, 0.048, 0.047, 0.96)
const JADE := Color(0.33, 0.63, 0.50)
const JADE_DIM := Color(0.22, 0.43, 0.35)
const PARCHMENT := Color(0.93, 0.86, 0.69)
const AMBER := Color(0.96, 0.67, 0.24)
const CINNABAR := Color(0.72, 0.23, 0.18)


static func panel(
	background: Color,
	border: Color,
	radius: int = 4,
	border_width: int = 1,
	margins: Vector4 = Vector4(12, 10, 12, 10),
	shadow_strength: float = 0.28
) -> StyleBoxFlat:
	var style := StyleBoxFlat.new()
	style.bg_color = background
	style.border_color = border
	style.set_border_width_all(border_width)
	style.set_corner_radius_all(radius)
	style.anti_aliasing = true
	style.content_margin_left = margins.x
	style.content_margin_top = margins.y
	style.content_margin_right = margins.z
	style.content_margin_bottom = margins.w
	if background.a > 0.45 and border_width > 0 and shadow_strength > 0.0:
		style.shadow_color = Color(0.0, 0.0, 0.0, shadow_strength)
		style.shadow_size = 6
		style.shadow_offset = Vector2(0, 3)
	return style


static func section_label(label: Label, font_size: int = 14, color: Color = PARCHMENT) -> void:
	label.add_theme_font_size_override("font_size", font_size)
	label.add_theme_color_override("font_color", color)
	label.add_theme_color_override("font_shadow_color", Color(0, 0, 0, 0.72))
	label.add_theme_constant_override("shadow_offset_x", 1)
	label.add_theme_constant_override("shadow_offset_y", 2)


static func apply_lacquer_button(
	button: Button,
	border: Color = JADE,
	selected: bool = false,
	danger: bool = false
) -> void:
	var normal_bg := Color(0.040, 0.085, 0.078, 0.98)
	if selected:
		normal_bg = Color(0.14, 0.105, 0.040, 0.98)
	if danger:
		normal_bg = Color(0.13, 0.040, 0.035, 0.98)
	button.add_theme_color_override("font_color", PARCHMENT)
	button.add_theme_color_override("font_hover_color", Color(1.0, 0.88, 0.60))
	button.add_theme_stylebox_override("normal", panel(normal_bg, border, 4, 2 if selected else 1))
	button.add_theme_stylebox_override("hover", panel(normal_bg.lightened(0.08), AMBER, 4, 2))
	button.add_theme_stylebox_override("pressed", panel(normal_bg.darkened(0.10), border, 4, 2))
	button.add_theme_stylebox_override("focus", panel(Color(0, 0, 0, 0), AMBER, 4, 2, Vector4.ZERO, 0.0))


static func textured_panel(texture_path: String, margin: float = 18.0) -> StyleBoxTexture:
	var style := StyleBoxTexture.new()
	style.texture = ResourceLoader.load(texture_path) as Texture2D
	style.texture_margin_left = margin
	style.texture_margin_top = margin
	style.texture_margin_right = margin
	style.texture_margin_bottom = margin
	style.content_margin_left = 14
	style.content_margin_top = 11
	style.content_margin_right = 14
	style.content_margin_bottom = 11
	return style

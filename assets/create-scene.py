import bpy, math, os
from mathutils import Quaternion

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
scene = bpy.context.scene
scene.render.fps = 30
scene.frame_end = 240

def mat(name, color, metallic=0.0, roughness=.3):
    m=bpy.data.materials.new(name); m.diffuse_color=(*color,1); m.use_nodes=True
    p=m.node_tree.nodes.get('Principled BSDF'); p.inputs['Base Color'].default_value=(*color,1)
    p.inputs['Metallic'].default_value=metallic; p.inputs['Roughness'].default_value=roughness
    return m
blue=mat('Cobalt ceramic',(.035,.12,.8),.4,.22)
lavender=mat('Lilac ceramic',(.48,.36,.88),.2,.27)
peach=mat('Apricot ceramic',(1,.48,.26),.15,.32)
silver=mat('Satin silver',(.76,.82,.97),.7,.22)

def smooth(obj,material):
    obj.data.materials.append(material)
    for f in obj.data.polygons:f.use_smooth=True

# A sculptural orbital knot, modelled in Blender, rather than a flat illustration.
bpy.ops.mesh.primitive_torus_add(major_segments=80,minor_segments=24,location=(0,0,0),major_radius=1.05,minor_radius=.27)
ring=bpy.context.object; ring.name='Cobalt orbit'; ring.rotation_euler=(.65,.45,-.2); smooth(ring,blue)
bpy.ops.mesh.primitive_torus_add(major_segments=80,minor_segments=20,location=(0,0,0),major_radius=1.05,minor_radius=.16)
cross=bpy.context.object; cross.name='Silver intersecting orbit'; cross.rotation_euler=(1.55,-.6,.8);smooth(cross,silver)
bpy.ops.mesh.primitive_uv_sphere_add(segments=40,ring_count=24,radius=.58,location=(0,0,0))
core=bpy.context.object;core.name='Idea core';smooth(core,lavender)
for name, loc, radius, material in [('Apricot satellite', (1.4,-.4,.9), .29, peach),('Lavender satellite',(-1.35,.25,-.8),.22,lavender),('Silver satellite',(.65,.45,-1.25),.13,silver)]:
    bpy.ops.mesh.primitive_uv_sphere_add(segments=32,ring_count=16,radius=radius,location=loc)
    obj=bpy.context.object;obj.name=name;smooth(obj,material)
    z=loc[2]
    for frame,dz in [(1,0),(120,.22),(240,0)]:
        obj.location.z=z+dz;obj.keyframe_insert(data_path='location',frame=frame)
for obj in [ring,cross]:
    original=obj.rotation_euler.copy()
    for frame, delta in [(1,0),(120,.35),(240,0)]:
        obj.rotation_euler=(original.x,original.y,original.z+delta)
        obj.keyframe_insert(data_path='rotation_euler',frame=frame)
scene.frame_set(1)
os.makedirs(os.path.join(ROOT,'public'),exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(ROOT,'assets','orbit.blend'))
bpy.ops.export_scene.gltf(filepath=os.path.join(ROOT,'public','orbit.glb'),export_format='GLB',export_animations=True)

# Transparent fallback for devices without WebGL; rendered from the same scene.
bpy.ops.object.camera_add(location=(0,-6.7,3.3))
camera=bpy.context.object
from mathutils import Vector
camera.rotation_euler=(Vector((0,0,0))-camera.location).to_track_quat('-Z','Y').to_euler()
camera.data.type='ORTHO';camera.data.ortho_scale=4.1;scene.camera=camera
for loc,power,size in [((2,-4,5),800,5),((-3,-2,1),500,4),((0,3,3),900,3)]:
    bpy.ops.object.light_add(type='AREA',location=loc);light=bpy.context.object;light.data.energy=power;light.data.shape='DISK';light.data.size=size
    light.rotation_euler=(Vector((0,0,0))-light.location).to_track_quat('-Z','Y').to_euler()
scene.render.engine='CYCLES';scene.cycles.samples=24
scene.render.resolution_x=700;scene.render.resolution_y=700;scene.render.resolution_percentage=100
scene.render.film_transparent=True;scene.render.image_settings.file_format='PNG'
scene.render.filepath=os.path.join(ROOT,'public','orbit-fallback.png')
bpy.ops.render.render(write_still=True)

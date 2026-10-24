import bpy,math,json,os
from pathlib import Path
from mathutils import Vector
ROOT=Path(os.environ.get('PO_MODEL_OUTPUT',Path(__file__).resolve().parents[2]))
CONFIG=[('nova-duel','Nova Duel',(0.2,0.65,1,1),'fighter'),('boost-circuit','Boost Circuit',(0.15,0.85,0.75,1),'car'),('voxel-trails','Voxel Trails',(0.55,0.83,0.35,1),'voxel'),('patchwork-planet','Patchwork Planet',(1,0.62,0.35,1),'plush'),('rift-arena','Rift Arena',(0.68,0.4,1,1),'arena')]
def mat(name,color,metal=0):
 m=bpy.data.materials.new(name);m.diffuse_color=color;m.use_nodes=True;p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=color;p.inputs['Metallic'].default_value=metal;p.inputs['Roughness'].default_value=.45;return m
def mesh(name,loc,scale,material,kind='box',rot=None):
 if kind=='ball':bpy.ops.mesh.primitive_uv_sphere_add(segments=16,ring_count=8,location=loc)
 elif kind=='cone':bpy.ops.mesh.primitive_cone_add(vertices=7,radius1=1,radius2=0,depth=2,location=loc)
 elif kind=='cylinder':bpy.ops.mesh.primitive_cylinder_add(vertices=16,radius=1,depth=2,location=loc)
 else:bpy.ops.mesh.primitive_cube_add(size=2,location=loc)
 o=bpy.context.object;o.name=name;o.scale=scale
 if rot:o.rotation_euler=rot
 o.data.materials.append(material)
 if kind=='box':
  mod=o.modifiers.new('Soft edges','BEVEL');mod.width=.08;mod.segments=2;o.modifiers.new('Weighted normals','WEIGHTED_NORMAL')
 return o
stats={}
for slug,title,color,kind in CONFIG:
 bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
 out=ROOT/slug; (out/'models').mkdir(parents=True,exist_ok=True);(out/'blender').mkdir(exist_ok=True);(out/'assets').mkdir(exist_ok=True)
 accent=mat('Accent',color);dark=mat('Ink',(0.035,.055,.1,1));skin=mat('Skin',(.83,.62,.46,1));white=mat('Light',(.95,.94,.86,1));hair=mat('Hair',(.06,.09,.16,1));gold=mat('Energy',(1,.72,.12,1));rubber=mat('Rubber',(.025,.03,.04,1));cloth=mat('Woven fabric',(.58,.36,.21,1))
 if kind in ('fighter','arena'):
  mesh('Torso',(0,0,1.63),(.39,.22,.48),accent);mesh('Belt',(0,0,1.25),(.42,.24,.09),dark);mesh('Head',(0,0,2.42),(.33,.28,.34),skin,'ball')
  for side in [-1,1]:
   mesh('Arm_L' if side<0 else 'Arm_R',(side*.59,0,1.7),(.18,.19,.42),accent,rot=(0,side*.2,0));mesh('Glove'+str(side),(side*.66,-.02,1.33),(.2,.21,.21),white,'ball');mesh('Leg'+str(side),(side*.22,0,.75),(.18,.19,.46),dark);mesh('Boot'+str(side),(side*.23,-.12,.27),(.22,.33,.18),accent);mesh('Eye'+str(side),(side*.12,-.267,2.46),(.055,.035,.055),dark,'ball')
  for i in range(7):
   angle=i*math.tau/7;mesh('Hair spike '+str(i),(math.cos(angle)*.23,math.sin(angle)*.16,2.79),(.16,.16,.39),gold if kind=='arena' else hair,'cone',rot=(math.sin(angle)*.3,math.cos(angle)*.4,0))
  if kind=='arena':mesh('Core',(0,-.245,1.8),(.12,.06,.12),gold,'ball')
 elif kind=='car':
  mesh('Chassis',(0,0,.55),(.85,1.35,.24),accent);mesh('Cabin',(0,-.1,.95),(.65,.67,.26),dark);mesh('Windshield',(0,-.73,1.02),(.58,.04,.2),white);mesh('Spoiler',(0,1.17,.98),(.95,.14,.08),accent)
  for x in [-.88,.88]:
   for y in [-.88,.88]:
    mesh('Wheel',(x,y,.38),(.33,.33,.18),rubber,'cylinder',rot=(0,math.pi/2,0));mesh('Wheel hub',(x*1.13,y,.38),(.18,.18,.185),white,'cylinder',rot=(0,math.pi/2,0))
  for x in [-.5,.5]:mesh('Headlight',(x,-1.36,.61),(.21,.045,.07),white)
 elif kind=='voxel':
  mesh('Body',(0,0,1.5),(.32,.2,.4),accent);mesh('Head',(0,0,2.15),(.29,.29,.29),skin);mesh('Hair',(0,.03,2.4),(.31,.31,.08),hair)
  for side in [-1,1]:
   mesh('Arm'+str(side),(side*.5,0,1.48),(.14,.17,.42),skin);mesh('Leg'+str(side),(side*.18,0,.66),(.14,.17,.43),dark);mesh('Eye'+str(side),(side*.11,-.292,2.21),(.04,.02,.04),dark)
  mesh('Pick handle',(.68,-.1,1.24),(.055,.055,.52),cloth,rot=(0,-.3,0));mesh('Pick head',(.77,-.1,1.72),(.28,.08,.08),white)
 elif kind=='plush':
  mesh('Body',(0,0,1.2),(.38,.25,.49),cloth,'ball');mesh('Head',(0,0,2),(.49,.33,.43),cloth,'ball')
  for side in [-1,1]:
   mesh('Button eye'+str(side),(side*.18,-.31,2.08),(.11,.055,.11),dark,'ball');mesh('Eye shine'+str(side),(side*.18-.025,-.36,2.11),(.027,.015,.027),white,'ball');mesh('Arm'+str(side),(side*.51,0,1.3),(.16,.17,.35),cloth,'ball',rot=(0,side*.35,0));mesh('Leg'+str(side),(side*.22,0,.49),(.16,.18,.33),cloth,'ball')
  mesh('Scarf',(0,0,1.65),(.43,.28,.08),accent);mesh('Scarf tail',(.2,-.24,1.41),(.1,.05,.29),accent)
  for i in range(5):mesh('Stitch'+str(i),((i-2)*.065,-.253,1.2),(.02,.02,.06),white,rot=(0,.3,0))
 objects=[o for o in bpy.context.scene.objects if o.type=='MESH'];bpy.ops.object.select_all(action='DESELECT')
 for o in objects:o.select_set(True)
 bpy.context.view_layer.objects.active=objects[0]
 bpy.ops.export_scene.gltf(filepath=str(out/'models'/'hero.glb'),export_format='GLB',use_selection=True,export_yup=True)
 count=sum(len(o.data.polygons) for o in objects);stats[slug]={'meshes':len(objects),'basePolygons':count,'tool':'Blender '+bpy.app.version_string,'model':'models/hero.glb','source':'blender/scene.blend'}
 floor=mat('Studio floor',(.04,.065,.11,1));mesh('Stage',(0,0,-.12),(4,4,.1),floor,'cylinder')
 world=bpy.context.scene.world;world.color=(.12,.12,.12);world.use_nodes=True;world.node_tree.nodes['Background'].inputs[0].default_value=(.045,.065,.11,1);world.node_tree.nodes['Background'].inputs[1].default_value=.5
 for loc,power,size in [((4,-5,7),1000,5),((-3,1,4),800,4),((0,4,6),1300,3)]:
  bpy.ops.object.light_add(type='AREA',location=loc);o=bpy.context.object;o.data.energy=power;o.data.shape='DISK';o.data.size=size;o.rotation_euler=(Vector((0,0,1))-o.location).to_track_quat('-Z','Y').to_euler()
 bpy.ops.object.camera_add(location=(5,-7,4.4));cam=bpy.context.object;cam.rotation_euler=(Vector((0,0,1.3))-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.type='ORTHO';cam.data.ortho_scale=6.5;bpy.context.scene.camera=cam
 scene=bpy.context.scene;scene.render.engine='CYCLES';scene.cycles.device='CPU';scene.cycles.samples=12;scene.render.resolution_x=800;scene.render.resolution_y=520;scene.render.resolution_percentage=100;scene.render.image_settings.file_format='PNG';scene.render.filepath=str(out/'assets'/'model-render.png');scene.view_settings.view_transform='AgX'
 bpy.ops.wm.save_as_mainfile(filepath=str(out/'blender'/'scene.blend'))
 bpy.ops.render.render(write_still=True)
 (out/'models'/'stats.json').write_text(json.dumps(stats[slug],indent=2));print('BUILT '+slug,flush=True)
(ROOT/'model-build-stats.json').write_text(json.dumps(stats,indent=2))

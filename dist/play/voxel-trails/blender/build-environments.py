import importlib.util,math,random,json,bpy
from pathlib import Path
spec=importlib.util.spec_from_file_location('artist',Path(__file__).with_name('rebuild-assets.py'));a=importlib.util.module_from_spec(spec);spec.loader.exec_module(a)
ROOT=Path.cwd()/'work/game-projects';random.seed(24)
for slug in ['nova-duel','boost-circuit','voxel-trails','patchwork-planet','rift-arena']:
 print('ENVIRONMENT '+slug,flush=True);bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
 for m in list(bpy.data.materials):bpy.data.materials.remove(m)
 a.parts=[];collection=bpy.data.collections.new(slug.replace('-','_')+'_Environment');bpy.context.scene.collection.children.link(collection);bpy.context.view_layer.active_layer_collection=bpy.context.view_layer.layer_collection.children[collection.name]
 stone=a.material('Carved stone',(.22,.27,.29),.9);edge=a.material('Cool trim',(.08,.12,.16),.65);metal=a.material('Brass detailing',(.45,.29,.1),.4,.65);wood=a.material('Warm timber',(.25,.115,.035),.88);light=a.material('Luminous inlay',(.23,.56,.65),.3,.2,1);fabric=a.material('Canvas',(.47,.32,.18),.95)
 if slug=='nova-duel':
  for x in [-11,-9,-7,-5,-3,-1,1,3,5,7,9,11]:
   for y in [-2.6,0,2.6]:a.cube('Temple paving',(x,y,-.035),(.98,1.28,.045),stone,bevel=.025)
  for x in [-10,10]:
   for y in [-4.4,4.4]:
    a.cube('Column foot',(x,y,.2),(.65,.65,.2),edge,bevel=.12);a.cylinder('Carved column',(x,y,2.1),.35,3.6,stone,vertices=12)
    for z in [.5,1.5,2.5,3.7]:a.torus('Column band',(x,y,z),.36,.055,metal)
    a.cube('Column capital',(x,y,4),(.55,.55,.14),edge,bevel=.1)
  for x in [-4,4]:a.cube('Shrine upright',(x,7,3),(.38,.6,3),stone,bevel=.1)
  a.cube('Shrine lintel',(0,7,6.2),(5,.75,.28),stone,bevel=.15);a.cube('Shrine brass line',(0,6.23,6.25),(4.4,.025,.04),metal,bevel=.01)
  for side in [-1,1]:
   a.cylinder('Banner pole',(side*6,6,2.8),.045,5.6,metal,vertices=10)
   for i in range(6):a.cube('Banner panel',(side*6+.45,6+math.sin(i*.4)*.05,4.7-i*.28),(.42,.025,.15),light if i==2 else edge,bevel=.018)
  for i in range(12):
   bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1,radius=1,location=((i-6)*6,16+(i%3)*6,-1));o=bpy.context.object;o.scale=(3+random.random()*2,3,5+random.random()*4);a.finish(o,'Layered mountain',edge)
 elif slug=='boost-circuit':
  seat=a.material('Stadium seats',(.08,.21,.26),.65);orange=a.material('Away team banners',(.68,.21,.045),.65)
  for side in [-1,1]:
   for row in range(4):
    x=side*(15.4+row*1.2);a.cube('Terraced stand',(x,0,row*.65+.3),(.65,20,.35),edge,bevel=.05)
    for y in range(-18,19,3):a.cube('Seat row',(x,y,row*.65+.75),(.32,.7,.25),seat,bevel=.08)
   for y in [-19,-9,1,11]:a.cube('Pitchside banner',(side*14.4,y,1.4),(.045,3.5,.35),light if y%2 else orange,bevel=.025)
   for y in [-20.8,20.8]:a.cylinder('Stadium mast',(side*15,y,4),.08,8,metal,vertices=10);a.cube('Floodlight array',(side*15,y,7.7),(.65,.2,.35),light,bevel=.055)
  for y in [-22,22]:a.cube('Goal perimeter',(0,y,.2),(6,.15,.2),edge,bevel=.08)
 elif slug=='voxel-trails':
  leaf=a.material('Foliage',(.11,.25,.08),.95)
  for x,y in [(-18,-18),(19,-14),(-19,13),(18,18)]:
   a.cylinder('Background trunk',(x,y,3),.28,6,wood,vertices=8)
   for z,r in [(5,2),(7,1.6),(8.5,1.1)]:
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1,radius=r,location=(x,y,z));a.finish(bpy.context.object,'Faceted canopy',leaf)
  for i in range(18):
   ang=i*math.tau/18;bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1,radius=1,location=(math.cos(ang)*17,math.sin(ang)*17,-1));o=bpy.context.object;o.scale=(2.6,2.4,2.2);a.finish(o,'Island rock skirt',stone)
  for x,y in [(-20,-6),(22,3),(-20,18)]:
   a.cube('Distant timber tower',(x,y,3),(.7,.7,3),wood,bevel=.05);a.cube('Tower cap',(x,y,6.3),(1.3,1.3,.15),edge,bevel=.05)
 elif slug=='patchwork-planet':
  felt=a.material('Sage felt',(.24,.36,.25),.97);paper=a.material('Cream paper',(.66,.57,.38),.95)
  for i in range(10):
   x=i*6-4;y=6+(i%2)*2;z=1.4+(i%3)*.6;a.ellipsoid('Fabric hill',(x,y,z),(4,1.1,3),felt,segments=12,rings=8)
   for j in range(6):a.tube('Hill stitching',[(x-2+j*.65,y-1.04,z+1.9),(x-1.8+j*.65,y-1.04,z+2.05)],[.025,.025],paper,sides=5)
  for x in [3,14,28,40]:
   a.cylinder('Button prop',(x,4,2),.8,.18,wood,(math.pi/2,0,0),vertices=20);a.torus('Button rim',(x,3.9,2),.65,.04,paper,(math.pi/2,0,0))
   for dx in [-.19,.19]:
    for dz in [-.19,.19]:a.ellipsoid('Button hole',(x+dx,3.89,2+dz),(.08,.02,.08),edge,segments=8,rings=6)
  for x in [0,11,22,33,44]:a.cube('Craft fence post',(x,3.3,.6),(.065,.07,.6),wood,bevel=.025)
  a.cube('Craft fence rail',(22,3.3,.9),(22,.05,.05),wood,bevel=.02)
 elif slug=='rift-arena':
  crystal=a.material('Violet crystal',(.2,.11,.38),.3,.25);glow=a.material('Rift energy',(.39,.19,.67),.35,.15,1.5)
  for x in [-17,17]:
   for y in [-17,17]:
    a.cylinder('Crystal foundation',(x,y,.25),1.5,.5,edge,vertices=8)
    for i in range(5):
     ang=i*math.tau/5;px=x+math.cos(ang)*.6;py=y+math.sin(ang)*.6;a.tube('Crystal shard',[(px,py,.5),(px,py,2+i*.25),(px+.15,py,3+i*.3)],[.32,.4,.004],crystal,sides=6)
    a.torus('Energy collar',(x,y,.65),1.1,.035,glow)
  for y in [-16.5,16.5]:
   a.torus('Rift portal',(0,y,3.6),2.5,.14,edge,(math.pi/2,0,0));a.torus('Portal light',(0,y-.01,3.6),2.28,.035,glow,(math.pi/2,0,0))
  for x in [-12,-8,-4,0,4,8,12]:a.cube('Floor inlay',(x,0,.025),(.015,14,.01),light,bevel=.005)
 out=ROOT/slug;o=a.prepare_mesh(slug,None);a.surface_detail();a.bake_atlas(o,out,'environment-textures');stats=a.validate(o,slug);stats['origin']='existing gameplay stage origin';bpy.ops.object.select_all(action='DESELECT');o.select_set(True);bpy.context.view_layer.objects.active=o;bpy.ops.export_scene.gltf(filepath=str(out/'models/environment.glb'),export_format='GLB',use_selection=True,export_yup=True,export_animations=False);(out/'models/environment-stats.json').write_text(json.dumps(stats,indent=2));bpy.ops.wm.save_as_mainfile(filepath=str(out/'blender/environment.blend'));print('ENVIRONMENT READY '+slug+' '+str(stats['triangles']),flush=True)

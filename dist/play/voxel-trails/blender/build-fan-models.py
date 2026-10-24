import importlib.util,os,math,json,bpy
from pathlib import Path
from mathutils import Vector
spec=importlib.util.spec_from_file_location('artist',Path(__file__).with_name('rebuild-assets.py'));a=importlib.util.module_from_spec(spec);spec.loader.exec_module(a)
ROOT=Path(os.environ.get('PO_MODEL_OUTPUT',str(Path.cwd()/'work/game-projects')))
def remove_prefixes(prefixes):
 for o in a.parts[:]:
  if any(o.name.startswith(p) for p in prefixes):a.parts.remove(o);bpy.data.objects.remove(o,do_unlink=True)
def assign_prefix(prefix,mat):
 for o in a.parts:
  if o.name.startswith(prefix):o.data.materials.clear();o.data.materials.append(mat)
def reset():
 bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
 for m in list(bpy.data.materials):bpy.data.materials.remove(m)
 a.parts=[]
def fan_hero(name):
 rig=a.hero(name=='vegeta');skin=bpy.data.materials.get('Warm skin');skin.node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value=(.8,.52,.32,1)
 blue=a.material('Saiyan blue',(.022,.07,.23),.75);ivory=a.material('Armour ivory',(.87,.89,.84),.4);gold=a.material('Armour ochre',(.71,.46,.12),.5);black=a.material('Ink hair',(.012,.016,.023),.65)
 remove_prefixes(['Jacket lapel','Knee trim','Energy core','Shoulder armour','Buckle'])
 if name=='goku':
  orange=bpy.data.materials['Accent'];orange.node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value=(.92,.22,.025,1)
  assign_prefix('Trouser',orange);assign_prefix('Bracer',blue);assign_prefix('Boot',blue);assign_prefix('Belt',blue);assign_prefix('Glove',skin);assign_prefix('Thumb',skin);assign_prefix('Hair',black);assign_prefix('Swept hair',black);assign_prefix('Fringe',black)
  verts=[(-.13,-.18,1.43),(.13,-.18,1.43),(0,-.195,1.15),(-.13,-.17,1.43),(.13,-.17,1.43),(0,-.185,1.15)];a.mesh('Blue gi undershirt',verts,[(0,1,2),(3,5,4),(0,3,4,1),(1,4,5,2),(2,5,3,0)],blue,'Spine')
  for side in [-1,1]:a.tube('Tied belt tail',[(side*.04,-.18,.91),(side*.07,-.21,.8),(side*.1,-.19,.7)],[.027,.027,.018],blue,'Hips',6)
  badge=a.cylinder('Gi badge',(-.15,-.177,1.27),.062,.012,ivory,(math.pi/2,0,0),'Spine',20)
  for x,z in [(-.17,1.27),(-.14,1.28),(-.15,1.245)]:a.tube('Badge ink',[(x,-.187,z-.015),(x+.022,-.187,z+.014)],[.005,.005],black,'Spine',5)
 elif name=='vegeta':
  accent=bpy.data.materials['Accent'];accent.node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value=(.025,.055,.22,1)
  assign_prefix('Glove',ivory);assign_prefix('Thumb',ivory);assign_prefix('Bracer',ivory);assign_prefix('Boot',ivory);assign_prefix('Belt',blue);assign_prefix('Hair',black);assign_prefix('Swept hair',black);assign_prefix('Fringe',black)
  a.loft('Saiyan chest armour',[(1.03,.23,.17,-.005),(1.16,.3,.195,-.005),(1.35,.31,.185,-.005),(1.43,.215,.13,0)],ivory,'Spine',16)
  a.cube('Abdominal armour',(0,-.191,1.095),(.19,.024,.105),gold,'Spine',.03)
  for i in range(4):a.cube('Armour rib',(0,-.22,1.02+i*.05),(.18,.006,.005),blue,'Spine',.002)
  for side in [-1,1]:a.ellipsoid('Armour shoulder',(side*.3,.005,1.37),(.16,.18,.08),ivory,f'UpperArm_{"L" if side<0 else "R"}',14,8)
  remove_prefixes(['Fringe']);a.tube('Widows peak',[(0,-.12,1.94),(0,-.19,1.88),(0,-.19,1.78)],[.09,.06,.002],black,'Head',7)
 else:
  purple=a.material('Lavender hair',(.32,.22,.45),.65);jacket=bpy.data.materials['Accent'];jacket.node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value=(.25,.3,.5,1)
  remove_prefixes(['Swept hair','Fringe']);assign_prefix('Hair',purple)
  for side in [-1,1]:a.tube('Parted fringe',[(side*.1,.03,1.98),(side*.16,-.11,1.91),(side*.16,-.15,1.72)],[.11,.095,.012],purple,'Head',10)
  metal=a.material('Sword steel',(.5,.58,.65),.3,.75);strap=a.material('Sword strap',(.22,.09,.055),.75)
  a.tube('Sword scabbard',[(-.26,.22,.8),(.04,.24,1.4),(.33,.25,2.02)],[.045,.045,.035],strap,'Spine',6);a.tube('Sword grip',[(.33,.25,2.02),(.43,.25,2.22)],[.025,.025],blue,'Spine',8);a.cube('Sword guard',(.33,.25,2.03),(.12,.055,.025),metal,'Spine',.012)
 # New accessories were added after the original bind; give each its declared bone group.
 for o in a.parts:
  if not o.modifiers.get('Deformation') and o.get('rig_bone'):
   names=o['rig_bone'].split('|');group=o.vertex_groups.new(name=names[0]);group.add(list(range(len(o.data.vertices))),1,'REPLACE');mod=o.modifiers.new('Deformation','ARMATURE');mod.object=rig;o.parent=rig
 return rig
def steve():
 rig=a.explorer();remove_prefixes(['Overall','Chest pocket','Strap buckle','Backpack','Pack flap','Pack strap'])
 cyan=a.material('Steve cyan shirt',(.025,.49,.5),.95);indigo=a.material('Steve indigo trousers',(.13,.12,.38),.95);brown=a.material('Pixel beard',(.11,.055,.027),.95)
 assign_prefix('Work shirt',cyan);assign_prefix('Sleeve',cyan);assign_prefix('Trouser',indigo)
 for side in [-1,1]:a.cube('Beard pixel',(side*.055,-.207,1.57),(.028,.012,.025),brown,'Head',.003)
 a.cube('Pixel mouth',(0,-.21,1.54),(.04,.012,.012),brown,'Head',.003)
 for o in a.parts:
  if not o.modifiers.get('Deformation') and o.get('rig_bone'):
   g=o.vertex_groups.new(name=o['rig_bone']);g.add(list(range(len(o.data.vertices))),1,'REPLACE');mod=o.modifiers.new('Deformation','ARMATURE');mod.object=rig;o.parent=rig
 return rig
def sackboy():
 rig=a.plush();remove_prefixes(['Knitted scarf','Scarf tail','Scarf fringe']);return rig
def octane():
 a.car();accent=bpy.data.materials['Accent'];accent.node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value=(.83,.23,.025,1);cage=a.material('Roll cage',(.075,.09,.1),.35,.65)
 for side in [-1,1]:a.tube('Octane cage rail',[(side*.66,-.75,.67),(side*.57,-.32,1.08),(side*.57,.45,1.11),(side*.68,.86,.68)],[.035]*4,cage,sides=10)
 for y,z in [(-.32,1.08),(.45,1.11)]:a.tube('Roof crossbar',[(-.57,y,z),(.57,y,z)],[.035,.035],cage,sides=10)
 return None
def sonic():
 blue=a.material('Sonic blue',(.015,.11,.64),.55);tan=a.material('Muzzle tan',(.85,.57,.34),.75);white=a.material('Glove white',(.91,.94,.92),.65);red=a.material('Shoe red',(.76,.025,.025),.5);black=a.material('Nose black',(.013,.018,.023),.35);green=a.material('Emerald eyes',(.025,.3,.12),.3)
 a.ellipsoid('Body',(0,0,.7),(.24,.18,.32),blue);a.ellipsoid('Belly',(0,-.164,.7),(.14,.035,.21),tan);a.ellipsoid('Head',(0,0,1.22),(.36,.3,.34),blue,segments=24,rings=16)
 for side in [-1,1]:
  for i in range(3):a.tube('Quill',[(side*.19,.16,1.32-i*.13),(side*.34,.32,1.25-i*.13),(side*.39,.42,1.04-i*.13)],[.19,.12,.004],blue,sides=9)
  a.tube('Ear',[(side*.22,.0,1.43),(side*.25,.0,1.68)],[.12,.002],blue,sides=8);a.tube('Inner ear',[(side*.22,-.055,1.46),(side*.25,-.02,1.62)],[.055,.002],tan,sides=7)
  a.ellipsoid('Eye white',(side*.12,-.255,1.29),(.14,.055,.16),white);a.ellipsoid('Eye',(side*.1,-.305,1.28),(.026,.015,.075),green);a.ellipsoid('Muzzle',(side*.1,-.26,1.1),(.16,.09,.1),tan)
  a.tube('Arm',[(side*.18,0,.87),(side*.37,-.02,.7),(side*.41,-.08,.6)],[.065,.055,.05],tan,sides=10);a.ellipsoid('Glove',(side*.42,-.1,.55),(.12,.1,.14),white)
  a.tube('Leg',[(side*.12,0,.51),(side*.16,0,.3),(side*.17,-.01,.16)],[.07,.065,.06],blue,sides=10);a.ellipsoid('Shoe',(side*.18,-.1,.12),(.16,.27,.12),red);a.cube('Shoe sole',(side*.18,-.1,.035),(.16,.25,.028),white,bevel=.025);a.cube('Shoe stripe',(side*.18,-.12,.215),(.165,.05,.026),white,bevel=.02)
 a.ellipsoid('Nose',(0,-.355,1.16),(.065,.08,.055),black);return None
def mario():
 red=a.material('Mario red',(.72,.025,.02),.72);blue=a.material('Overall blue',(.025,.12,.44),.85);skin=a.material('Peach skin',(.83,.51,.28),.75);white=a.material('Gloves white',(.91,.91,.84),.7);brown=a.material('Boot leather',(.19,.075,.025),.8);hair=a.material('Hair and moustache',(.09,.035,.014),.95);gold=a.material('Buttons gold',(.94,.62,.07),.4,.25);eyes=a.material('Iris blue',(.02,.18,.48),.35)
 a.ellipsoid('Torso',(0,0,.65),(.28,.2,.3),red);a.ellipsoid('Overalls',(0,-.015,.5),(.285,.21,.23),blue);a.cube('Overall bib',(0,-.2,.7),(.18,.025,.16),blue,bevel=.035);a.ellipsoid('Head',(0,-.01,1.13),(.28,.235,.29),skin,segments=24,rings=16);a.ellipsoid('Cap',(0,.01,1.36),(.3,.25,.17),red,segments=24,rings=12);a.ellipsoid('Cap brim',(0,-.24,1.31),(.29,.17,.038),red)
 a.ellipsoid('Cap badge',(0,-.224,1.425),(.075,.018,.075),white)
 a.tube('M left',[(-.043,-.245,1.39),(-.043,-.245,1.46),(0,-.245,1.42),(.043,-.245,1.46),(.043,-.245,1.39)],[.012]*5,red,sides=6)
 for side in [-1,1]:
  a.ellipsoid('Ear',(side*.275,0,1.14),(.065,.06,.09),skin);a.ellipsoid('Eye white',(side*.09,-.217,1.2),(.057,.027,.09),white);a.ellipsoid('Iris',(side*.09,-.244,1.2),(.026,.012,.05),eyes)
  a.tube('Brow',[(side*.04,-.235,1.29),(side*.09,-.24,1.31),(side*.145,-.215,1.29)],[.015,.019,.013],hair,sides=7)
  a.tube('Arm',[(side*.22,0,.84),(side*.36,-.01,.67),(side*.4,-.03,.57)],[.105,.095,.08],red,sides=12);a.ellipsoid('Glove',(side*.42,-.05,.53),(.12,.105,.13),white)
  a.tube('Leg',[(side*.13,0,.42),(side*.16,0,.24),(side*.16,0,.15)],[.11,.1,.09],blue,sides=12);a.ellipsoid('Boot',(side*.17,-.08,.11),(.14,.22,.11),brown);a.ellipsoid('Overall button',(side*.14,-.23,.75),(.035,.015,.035),gold)
  a.cube('Overall strap',(side*.16,-.17,.85),(.035,.025,.16),blue,bevel=.012)
 a.ellipsoid('Round nose',(0,-.285,1.1),(.105,.105,.09),skin)
 for i in range(7):a.ellipsoid('Moustache lobe',((i-3)*.045,-.235,1.02+abs(i-3)*.012),(.052,.045,.04),hair,segments=12,rings=8)
 return None
def pacman():
 yellow=a.material('Pac-Man yellow',(.95,.65,.01),.4);black=a.material('Mouth and eyes',(.02,.018,.018),.8);orange=a.material('Orange gloves',(.9,.25,.015),.65);red=a.material('Cherry boots',(.64,.035,.012),.55)
 v=[];f=[];n=18;m=30;r=.61;angle=.46
 for i in range(n+1):
  t=i*math.pi/n
  for j in range(m+1):p=angle+j*(math.tau-2*angle)/m;v.append((r*math.sin(t)*math.cos(p),r*math.cos(t),.86+r*math.sin(t)*math.sin(p)))
 for i in range(n):
  for j in range(m):a0=i*(m+1)+j;f.append((a0,a0+1,a0+m+2,a0+m+1))
 outer=len(f);axis=[]
 for i in range(n+1):axis.append(len(v));v.append((0,r*math.cos(i*math.pi/n),.86))
 for side in [0,m]:
  for i in range(n):f.append((i*(m+1)+side,(i+1)*(m+1)+side,axis[i+1],axis[i]))
 o=a.mesh('Pac-Man body',v,f,yellow);o.data.materials.append(black)
 for poly in o.data.polygons:
  if poly.index>=outer:poly.material_index=1
 for side in [-1,1]:
  a.tube('Leg',[(side*.2,0,.43),(side*.24,0,.21)],[.065,.055],yellow,sides=10);a.ellipsoid('Boot',(side*.25,-.14,.11),(.19,.29,.11),red);a.tube('Arm',[(side*.5,0,.88),(side*.7,-.03,.72),(side*.72,-.08,.6)],[.06,.055,.045],yellow,sides=10);a.ellipsoid('Glove',(side*.73,-.09,.55),(.13,.105,.14),orange)
 a.ellipsoid('Eye',(-.15,-.51,1.12),(.065,.028,.13),black);return None

CONFIG=[('nova-duel','goku',fan_hero),('boost-circuit','octane',octane),('voxel-trails','steve',steve),('patchwork-planet','sackboy',sackboy),('rift-arena','vegeta',fan_hero),('fan-models/trunks','trunks',fan_hero),('fan-models/sonic','sonic',sonic),('fan-models/mario','mario',mario),('fan-models/pacman','pacman',pacman)]
if __name__=='__main__':
 for slug,name,build in CONFIG:
  if os.environ.get('PO_FAN_FILTER') and name not in os.environ['PO_FAN_FILTER'].split(','):continue
  print('BUILD FAN MODEL '+name,flush=True);reset();out=ROOT/slug
  for folder in ['models','blender','assets']:(out/folder).mkdir(parents=True,exist_ok=True)
  c=bpy.data.collections.new(name.title()+'_Game_Asset');bpy.context.scene.collection.children.link(c);bpy.context.view_layer.active_layer_collection=bpy.context.view_layer.layer_collection.children[c.name];bpy.context.scene.unit_settings.system='METRIC';bpy.context.scene.unit_settings.scale_length=1
  rig=build(name) if build==fan_hero else build();a.surface_detail();o=a.prepare_mesh(slug,rig);a.bake_atlas(o,out);stats=a.validate(o,slug);stats['character']=name;stats['fanModel']=True
  bpy.ops.object.select_all(action='DESELECT');o.select_set(True);bpy.context.view_layer.objects.active=o
  if rig:rig.select_set(True)
  bpy.ops.export_scene.gltf(filepath=str(out/'models/hero.glb'),export_format='GLB',use_selection=True,export_yup=True,export_animations=False,export_skins=True)
  low=o.copy();low.data=o.data.copy();bpy.context.collection.objects.link(low);low.name='LOD1';bpy.ops.object.select_all(action='DESELECT');low.select_set(True);bpy.context.view_layer.objects.active=low;mod=low.modifiers.new('LOD reduction','DECIMATE');mod.ratio=.52;bpy.ops.object.modifier_apply(modifier=mod.name)
  if rig:rig.select_set(True)
  bpy.ops.export_scene.gltf(filepath=str(out/'models/hero-low.glb'),export_format='GLB',use_selection=True,export_yup=True,export_animations=False,export_skins=True);stats['lodTriangles']=sum(len(p.vertices)-2 for p in low.data.polygons);bpy.data.objects.remove(low,do_unlink=True)
  a.studio(out,'car' if name=='octane' else 'plush' if name in ['sackboy','sonic','mario','pacman'] else 'fighter');bpy.context.scene.render.filepath='//../assets/model-render.png';bpy.ops.wm.save_as_mainfile(filepath=str(out/'blender/scene.blend'));(out/'models/stats.json').write_text(json.dumps(stats,indent=2));print('VALIDATED FAN '+name+' '+str(stats['triangles']),flush=True)

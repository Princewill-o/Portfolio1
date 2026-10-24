import bpy,bmesh,math,json,os
from pathlib import Path
from mathutils import Vector
ROOT=Path(os.environ.get('PO_MODEL_OUTPUT',str(Path.cwd()/'work/game-projects')))
TAU=math.tau
parts=[]
def material(name,color,rough=.65,metal=0,emit=0):
 m=bpy.data.materials.new(name);m.diffuse_color=(*color,1);m.use_nodes=True;p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=(*color,1);p.inputs['Roughness'].default_value=rough;p.inputs['Metallic'].default_value=metal
 if emit:p.inputs['Emission Color'].default_value=(*color,1);p.inputs['Emission Strength'].default_value=emit
 return m
def finish(o,name,mat,bone=None,smooth=True):
 o.name=name
 if mat:o.data.materials.append(mat)
 bpy.context.view_layer.objects.active=o;o.select_set(True);bpy.ops.object.transform_apply(location=False,rotation=True,scale=True)
 if smooth:
  for p in o.data.polygons:p.use_smooth=True
 if bone:o['rig_bone']=bone
 parts.append(o);return o
def ellipsoid(name,loc,scale,mat,bone=None,segments=16,rings=10):
 bpy.ops.object.select_all(action='DESELECT');bpy.ops.mesh.primitive_uv_sphere_add(segments=segments,ring_count=rings,location=loc);o=bpy.context.object;o.scale=scale;return finish(o,name,mat,bone)
def cube(name,loc,scale,mat,bone=None,bevel=.035):
 bpy.ops.object.select_all(action='DESELECT');bpy.ops.mesh.primitive_cube_add(size=2,location=loc);o=bpy.context.object;o.scale=scale;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
 if bevel:
  mod=o.modifiers.new('Crafted edges','BEVEL');mod.width=bevel;mod.segments=2;bpy.ops.object.modifier_apply(modifier=mod.name)
 return finish(o,name,mat,bone)
def mesh(name,vertices,faces,mat,bone=None):
 data=bpy.data.meshes.new(name+' topology');data.from_pydata(vertices,[],faces);data.update();o=bpy.data.objects.new(name,data);bpy.context.collection.objects.link(o);return finish(o,name,mat,bone)
def loft(name,rings,mat,bone=None,segments=16):
 # Closed quad ring topology; caps are triangle fans, never N-gons.
 verts=[];faces=[]
 for z,rx,ry,cy in rings:
  verts.extend((math.cos(a*TAU/segments)*rx,cy+math.sin(a*TAU/segments)*ry,z) for a in range(segments))
 for j in range(len(rings)-1):
  for i in range(segments):a=j*segments+i;b=j*segments+(i+1)%segments;faces.append((a,b,b+segments,a+segments))
 for end,flip in [(0,True),(len(rings)-1,False)]:
  center=len(verts);z,rx,ry,cy=rings[end];verts.append((0,cy,z))
  for i in range(segments):
   a=end*segments+i;b=end*segments+(i+1)%segments;faces.append((center,b,a) if flip else (center,a,b))
 return mesh(name,verts,faces,mat,bone)
def tube(name,path,radii,mat,bone=None,sides=10):
 points=[Vector(p) for p in path];v=[];f=[]
 for j,p in enumerate(points):
  tangent=(points[min(j+1,len(points)-1)]-points[max(0,j-1)]).normalized();axis=Vector((0,1,0)) if abs(tangent.y)<.9 else Vector((1,0,0));u=tangent.cross(axis).normalized();w=tangent.cross(u).normalized()
  for i in range(sides):v.append(tuple(p+radii[j]*(math.cos(i*TAU/sides)*u+math.sin(i*TAU/sides)*w)))
 for j in range(len(points)-1):
  for i in range(sides):a=j*sides+i;b=j*sides+(i+1)%sides;f.append((a,b,b+sides,a+sides))
 for end,reverse in [(0,True),(len(points)-1,False)]:
  center=len(v);v.append(tuple(points[end]))
  for i in range(sides):a=end*sides+i;b=end*sides+(i+1)%sides;f.append((center,b,a) if reverse else (center,a,b))
 return mesh(name,v,f,mat,bone)
def torus(name,loc,major,minor,mat,rot=(0,0,0),bone=None):
 bpy.ops.object.select_all(action='DESELECT');bpy.ops.mesh.primitive_torus_add(major_radius=major,minor_radius=minor,major_segments=24,minor_segments=8,location=loc,rotation=rot);return finish(bpy.context.object,name,mat,bone)
def cylinder(name,loc,radius,depth,mat,rot=(0,0,0),bone=None,vertices=20):
 bpy.ops.object.select_all(action='DESELECT');bpy.ops.mesh.primitive_cylinder_add(vertices=vertices,radius=radius,depth=depth,location=loc,rotation=rot);return finish(bpy.context.object,name,mat,bone)
def rotate(o,axis,angle):o.rotation_euler[axis]=angle;bpy.context.view_layer.objects.active=o;bpy.ops.object.transform_apply(location=False,rotation=True,scale=False)
def make_rig(height=2,plush=False):
 data=bpy.data.armatures.new('Deformation rig');rig=bpy.data.objects.new('Character_Rig',data);bpy.context.collection.objects.link(rig);bpy.context.view_layer.objects.active=rig;rig.select_set(True);bpy.ops.object.mode_set(mode='EDIT')
 s=height/2
 bones=[('Root',(0,0,0),(0,0,.2),None),('Hips',(0,0,.75),(0,0,1),'Root'),('Spine',(0,0,1),(0,0,1.4),'Hips'),('Head',(0,0,1.42),(0,0,1.9),'Spine')]
 for side,sign in [('L',-1),('R',1)]:
  bones.extend([(f'UpperArm_{side}',(sign*.27,0,1.35),(sign*.43,0,1.12),'Spine'),(f'Forearm_{side}',(sign*.43,0,1.12),(sign*.55,-.015,.94),f'UpperArm_{side}'),(f'Hand_{side}',(sign*.55,-.015,.94),(sign*.59,-.02,.83),f'Forearm_{side}'),(f'Thigh_{side}',(sign*.14,0,.84),(sign*.16,0,.46),'Hips'),(f'Shin_{side}',(sign*.16,0,.46),(sign*.17,-.01,.14),f'Thigh_{side}'),(f'Foot_{side}',(sign*.17,-.01,.14),(sign*.17,-.2,.08),f'Shin_{side}')])
 for name,head,tail,parent in bones:
  b=data.edit_bones.new(name);b.head=Vector(head)*s;b.tail=Vector(tail)*s
  if parent:b.parent=data.edit_bones[parent]
 bpy.ops.object.mode_set(mode='OBJECT');rig.show_in_front=True;rig['purpose']='Named deformation bones; arm and leg meshes include intermediate edge rings.';return rig
def bind(rig):
 # Deliberate rigid groups for face/garment details; blended two-bone weights on limbs.
 for o in parts:
  hint=o.get('rig_bone')
  if not hint:continue
  names=hint.split('|');groups=[o.vertex_groups.new(name=n) for n in names]
  for v in o.data.vertices:
   point=o.matrix_world@v.co
   if len(names)==1:groups[0].add([v.index],1,'REPLACE')
   else:
    values=[]
    for n in names:
     b=rig.data.bones[n];a=b.head_local;d=b.tail_local-a;t=max(0,min(1,(point-a).dot(d)/max(.00001,d.length_squared)));dist=(point-a-d*t).length;values.append(1/(dist+.035)**3)
    total=sum(values)
    for group,value in zip(groups,values):group.add([v.index],value/total,'REPLACE')
  modifier=o.modifiers.new('Deformation','ARMATURE');modifier.object=rig;o.parent=rig
def hero(arena=False):
 accent=material('Accent',(.26,.44,.71) if not arena else (.38,.25,.58),.48);ink=material('Midnight fabric',(.025,.045,.08),.85);skin=material('Warm skin',(.64,.39,.22),.68);white=material('Ivory trim',(.83,.87,.84),.6);hair=material('Hair',(.035,.055,.1) if not arena else (.77,.48,.12),.55);hairLight=material('Hair highlights',(.07,.13,.21) if not arena else (.95,.69,.22),.55);gold=material('Brass',(.85,.53,.13),.35,.45);eyes=material('Eye white',(.94,.96,.96),.36);iris=material('Iris',(.04,.18,.25),.32);black=material('Lash',(.014,.02,.03),.65)
 loft('Tailored torso',[(.82,.17,.13,0),(.92,.21,.15,0),(1.04,.22,.15,0),(1.2,.29,.17,0),(1.34,.3,.17,0),(1.43,.22,.13,0)],accent,'Spine',16)
 loft('Pelvis',[(.72,.18,.13,0),(.81,.22,.15,0),(.91,.21,.15,0)],ink,'Hips',14)
 cylinder('Neck',(0,0,1.46),.08,.15,skin,bone='Head',vertices=14)
 loft('Sculpted head',[(1.49,.1,.1,-.015),(1.55,.16,.145,-.015),(1.65,.215,.18,0),(1.77,.22,.185,0),(1.86,.185,.16,.015),(1.91,.11,.105,.02)],skin,'Head',20)
 for side in [-1,1]:
  suffix='L' if side<0 else 'R';arm=f'UpperArm_{suffix}|Forearm_{suffix}'
  ellipsoid('Ear '+suffix,(side*.22,0,1.7),(.045,.055,.075),skin,'Head',12,8)
  tube('Sleeve '+suffix,[(side*.26,0,1.34),(side*.34,0,1.3),(side*.42,0,1.14),(side*.49,-.005,1.04)],[.12,.13,.1,.095],accent,arm,12)
  tube('Bracer '+suffix,[(side*.48,-.005,1.05),(side*.51,-.012,.99),(side*.55,-.015,.94)],[.101,.095,.085],white,f'Forearm_{suffix}',12)
  ellipsoid('Glove '+suffix,(side*.57,-.025,.9),(.105,.085,.12),ink,f'Hand_{suffix}',12,8)
  ellipsoid('Thumb '+suffix,(side*.51,-.065,.91),(.048,.055,.07),ink,f'Hand_{suffix}',10,6)
  tube('Trouser '+suffix,[(side*.13,0,.85),(side*.16,0,.72),(side*.17,0,.53),(side*.17,0,.41),(side*.17,0,.24)],[.13,.135,.11,.105,.095],ink,f'Thigh_{suffix}|Shin_{suffix}',12)
  ellipsoid('Boot '+suffix,(side*.17,-.07,.13),(.12,.205,.13),accent,f'Foot_{suffix}',14,8)
  cube('Boot sole '+suffix,(side*.17,-.07,.037),(.125,.2,.032),ink,f'Foot_{suffix}',.025)
  tube('Knee trim '+suffix,[(side*.17,-.09,.5),(side*.17,-.107,.455),(side*.17,-.09,.41)],[.065,.065,.052],white,f'Shin_{suffix}',8)
  ellipsoid('Eye '+suffix,(side*.09,-.178,1.735),(.068,.017,.036),eyes,'Head',14,8)
  ellipsoid('Iris '+suffix,(side*.09,-.194,1.733),(.023,.007,.029),iris,'Head',12,8)
  ellipsoid('Catchlight '+suffix,(side*.09-.008,-.201,1.744),(.006,.004,.008),eyes,'Head',8,6)
  tube('Brow '+suffix,[(side*.025,-.194,1.79),(side*.09,-.199,1.795),(side*.157,-.177,1.81)],[.014,.017,.009],black,'Head',6)
 ellipsoid('Nose',(0,-.187,1.655),(.034,.045,.047),skin,'Head',12,8)
 tube('Mouth',[(-.045,-.161,1.588),(0,-.177,1.58),(.045,-.161,1.588)],[.006,.008,.006],black,'Head',6)
 loft('Hair cap',[(1.82,.217,.187,.018),(1.92,.18,.15,.026),(1.99,.075,.075,.03)],hair,'Head',18)
 for i in range(11):
  a=i*TAU/11;start=(math.cos(a)*.14,.035+math.sin(a)*.11,1.91);end=(math.cos(a)*(.25+(i%3)*.03),.03+math.sin(a)*.2,2.07+(i%3)*.065)
  tube('Swept hair '+str(i),[start,((start[0]+end[0])*.5,(start[1]+end[1])*.5,2.02),end],[.085,.065,.003],hairLight if i%3==0 else hair,'Head',7)
 for i,x in enumerate([-.14,-.065,.025,.12]):tube('Fringe '+str(i),[(x,.0,1.97),(x,-.16,1.91),(x*.75,-.192,1.79+(i%2)*.03)],[.074,.07,.003],hair,'Head',7)
 cube('Belt',(0,-.015,.91),(.23,.165,.037),white,'Hips',.02);cube('Buckle',(0,-.185,.91),(.048,.018,.043),gold,'Hips',.012)
 for side in [-1,1]:
  panel=cube('Jacket lapel',(side*.095,-.162,1.31),(.036,.017,.16),white,'Spine',.012);rotate(panel,1,side*-.24)
 if arena:
  ellipsoid('Energy core',(0,-.188,1.2),(.067,.035,.067),material('Core glow',(.29,.8,1),.28,.1,2),'Spine',14,8)
  for side in [-1,1]:cube('Shoulder armour',(side*.3,.01,1.39),(.135,.18,.07),gold,f'UpperArm_{"L" if side<0 else "R"}',.045)
 rig=make_rig();bind(rig);return rig

def plush():
 fabric=material('Woven caramel',(.45,.28,.14),.96);edge=material('Seam shadow',(.2,.105,.048),.94);thread=material('Cotton thread',(.78,.62,.37),.95);buttons=material('Espresso buttons',(.045,.031,.025),.4);accent=material('Accent',(.67,.16,.08),.9);metal=material('Zipper brass',(.58,.38,.13),.48,.5)
 ellipsoid('Pear shaped body',(0,.015,.63),(.24,.18,.32),fabric,'Spine',20,14)
 ellipsoid('Soft round head',(0,0,1.12),(.32,.245,.28),fabric,'Head',24,16)
 for side in [-1,1]:
  suffix='L' if side<0 else 'R'
  tube('Soft arm '+suffix,[(side*.2,0,.84),(side*.31,0,.73),(side*.35,-.025,.57)],[.095,.09,.075],fabric,f'UpperArm_{suffix}|Forearm_{suffix}',12)
  ellipsoid('Mitten '+suffix,(side*.35,-.025,.52),(.087,.075,.11),fabric,f'Hand_{suffix}',14,8)
  tube('Leg '+suffix,[(side*.115,0,.47),(side*.13,0,.32),(side*.13,0,.17)],[.09,.085,.075],fabric,f'Thigh_{suffix}|Shin_{suffix}',12)
  ellipsoid('Soft foot '+suffix,(side*.13,-.045,.11),(.1,.14,.1),fabric,f'Foot_{suffix}',14,10)
  cylinder('Button '+suffix,(side*.117,-.225,1.16),.087,.035,buttons,(math.pi/2,0,0),'Head',20)
  torus('Button rim '+suffix,(side*.117,-.246,1.16),.071,.008,edge,(math.pi/2,0,0),'Head')
  for dx in [-.019,.019]:
   for dz in [-.019,.019]:ellipsoid('Button hole',(side*.117+dx,-.246,1.16+dz),(.009,.008,.009),edge,'Head',8,6)
  tube('Button thread '+suffix,[(side*.117-.02,-.255,1.14),(side*.117+.02,-.255,1.18)],[.004,.004],thread,'Head',5)
  for i in range(7):
   a=i*.23-1.5;x=side*.289*math.cos(a);z=1.12+.26*math.sin(a)
   tube('Head stitch',[(x-.008,-.125,z-.008),(x+.008,-.13,z+.008)],[.004,.004],thread,'Head',5)
 mouth=[(-.10,-.22,1.05),(-.06,-.242,1.015),(0,-.25,1.0),(.06,-.242,1.015),(.10,-.22,1.05)]
 tube('Smile seam',mouth,[.006]*5,edge,'Head',6)
 for i in range(7):
  x=(i-3)*.026;z=1.005+abs(x)*.3;tube('Smile stitch',[(x,-.252,z-.012),(x,-.255,z+.012)],[.003,.003],thread,'Head',5)
 scarf=torus('Knitted scarf',(0,.005,.915),.19,.045,accent,bone='Spine');scarf.scale.y=.85;bpy.context.view_layer.objects.active=scarf;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
 tail=cube('Scarf tail',(.13,-.165,.75),(.055,.028,.17),accent,'Spine',.022);rotate(tail,1,-.13)
 for i in range(5):tube('Scarf fringe',[(.09+i*.02,-.167,.59),(.085+i*.02,-.169,.54)],[.006,.004],accent,'Spine',5)
 tube('Zipper tape',[(0,-.169,.45),(0,-.181,.63),(0,-.15,.82)],[.014,.014,.014],edge,'Spine',6)
 for i in range(10):cube('Zipper tooth',(0,-.188,.48+i*.028),(.019,.006,.006),metal,'Spine',.003)
 torus('Zipper pull',(0,-.188,.78),.025,.006,metal,(math.pi/2,0,0),'Spine')
 rig=make_rig(1.3)
 # Compact proportions use their own rest coordinates rather than a stretched human skeleton.
 bpy.context.view_layer.objects.active=rig;bpy.ops.object.mode_set(mode='EDIT')
 for side,sign in [('L',-1),('R',1)]:
  for name,head,tail in [(f'UpperArm_{side}',(sign*.2,0,.84),(sign*.3,0,.7)),(f'Forearm_{side}',(sign*.3,0,.7),(sign*.35,-.02,.57)),(f'Hand_{side}',(sign*.35,-.02,.57),(sign*.35,-.02,.46)),(f'Thigh_{side}',(sign*.11,0,.48),(sign*.13,0,.3)),(f'Shin_{side}',(sign*.13,0,.3),(sign*.13,0,.14)),(f'Foot_{side}',(sign*.13,0,.14),(sign*.13,-.1,.08))]:rig.data.edit_bones[name].head=head;rig.data.edit_bones[name].tail=tail
 rig.data.edit_bones['Head'].head=(0,0,.95);rig.data.edit_bones['Head'].tail=(0,0,1.35);bpy.ops.object.mode_set(mode='OBJECT');bind(rig);return rig

def explorer():
 skin=material('Warm skin',(.58,.33,.18),.8);accent=material('Accent',(.12,.32,.29),.88);denim=material('Canvas trousers',(.065,.105,.15),.95);brown=material('Leather',(.23,.12,.057),.8);hair=material('Dark hair',(.035,.027,.021),.9);white=material('Ivory',(.88,.87,.72),.6);black=material('Eyes',(.025,.035,.035),.4);steel=material('Forged steel',(.3,.38,.39),.44,.7);gold=material('Brass buckle',(.65,.4,.12),.4,.65)
 cube('Work shirt',(0,0,1.12),(.23,.145,.28),accent,'Spine',.045);cube('Head',(0,-.005,1.68),(.225,.195,.235),skin,'Head',.05)
 cube('Hair cap',(0,.018,1.89),(.235,.195,.055),hair,'Head',.028)
 for i in range(5):cube('Pixel fringe',((i-2)*.085,-.185,1.84-(i%2)*.035),(.05,.035,.06),hair,'Head',.012)
 for side in [-1,1]:
  suffix='L' if side<0 else 'R';bone=f'UpperArm_{suffix}|Forearm_{suffix}'
  cube('Sleeve '+suffix,(side*.31,0,1.24),(.095,.145,.15),accent,f'UpperArm_{suffix}',.032)
  tube('Forearm '+suffix,[(side*.33,0,1.13),(side*.39,-.01,.98),(side*.43,-.025,.91)],[.083,.078,.07],skin,bone,8)
  cube('Hand '+suffix,(side*.44,-.025,.87),(.078,.075,.09),skin,f'Hand_{suffix}',.028)
  cube('Trouser '+suffix,(side*.13,0,.59),(.105,.13,.27),denim,f'Thigh_{suffix}|Shin_{suffix}',.025)
  cube('Boot '+suffix,(side*.13,-.07,.19),(.115,.195,.15),brown,f'Foot_{suffix}',.035);cube('Boot sole '+suffix,(side*.13,-.07,.055),(.12,.2,.035),black,f'Foot_{suffix}',.02)
  cube('Eye white',(side*.095,-.202,1.7),(.045,.014,.04),white,'Head',.009);cube('Pupil',(side*.095,-.218,1.698),(.022,.007,.028),black,'Head',.005)
  cube('Brow',(side*.095,-.206,1.77),(.058,.012,.012),hair,'Head',.006)
  cube('Overall strap',(side*.145,-.16,1.16),(.035,.02,.23),denim,'Spine',.01);cube('Strap buckle',(side*.145,-.184,1.2),(.034,.012,.035),gold,'Spine',.008)
 cube('Overall bib',(0,-.16,1.01),(.2,.023,.15),denim,'Spine',.025);cube('Chest pocket',(0,-.19,1.045),(.07,.012,.065),accent,'Spine',.012)
 cube('Backpack',(0,.24,1.14),(.21,.105,.27),brown,'Spine',.055);cube('Pack flap',(0,.25,1.36),(.22,.115,.065),brown,'Spine',.03)
 for side in [-1,1]:cube('Pack strap',(side*.11,.355,1.15),(.018,.012,.18),gold,'Spine',.008)
 tube('Pick handle',[(.46,-.1,.76),(.51,-.1,1.03),(.56,-.1,1.3)],[.035,.035,.03],brown,'Hand_R',8)
 tube('Forged pickaxe',[(.33,-.1,1.25),(.43,-.1,1.34),(.57,-.1,1.36),(.72,-.1,1.31),(.78,-.1,1.22)],[.012,.04,.05,.035,.008],steel,'Hand_R',8)
 rig=make_rig();bind(rig);return rig

def car():
 accent=material('Accent',(.035,.38,.34),.3,.48);ink=material('Carbon trim',(.018,.029,.039),.45,.15);glass=material('Tinted glass',(.025,.09,.13),.16,.45);silver=material('Machined alloy',(.55,.63,.68),.25,.85);rubber=material('Tire rubber',(.016,.019,.024),.95);red=material('Brake calipers',(.65,.055,.025),.42,.3);light=material('LED white',(.72,.91,1),.2,.1,2);rear=material('Tail light',(.9,.06,.025),.3,.15,1.6)
 rings=[(-1.72,.56,.34,.55),(-1.52,.8,.25,.64),(-.83,.9,.25,.72),(.65,.91,.25,.73),(1.34,.82,.29,.62),(1.6,.62,.35,.55)]
 v=[];f=[];section=[(-1,.3),(-.93,.92),(-.65,1),( .65,1),(.93,.92),(1,.3),(.72,0),(-.72,0)]
 for y,w,bottom,top in rings:
  for x,z in section:v.append((x*w,y,bottom+(top-bottom)*z))
 for j in range(len(rings)-1):
  for i in range(8):a=j*8+i;b=j*8+(i+1)%8;f.append((a,b,b+8,a+8))
 for end,flip in [(0,True),(len(rings)-1,False)]:
  center=len(v);y,w,b,t=rings[end];v.append((0,y,(b+t)/2))
  for i in range(8):a=end*8+i;c=end*8+(i+1)%8;f.append((center,c,a) if flip else (center,a,c))
 mesh('Aerodynamic body shell',v,f,accent)
 cube('Front splitter',(0,-1.54,.26),(.81,.23,.055),ink,bevel=.045);cube('Rear diffuser',(0,1.44,.28),(.74,.19,.06),ink,bevel=.035)
 cabin=[(-.75,.63,.66),(-.37,.56,1.02),(.45,.56,1.06),(.85,.66,.68)]
 verts=[]
 for y,w,z in cabin:verts.extend([(-w,y,z),(w,y,z),(-w,y,.62),(w,y,.62)])
 faces=[(0,1,5,4),(4,5,9,8),(8,9,13,12),(0,4,6,2),(4,8,10,6),(8,12,14,10),(1,3,7,5),(5,7,11,9),(9,11,15,13),(2,6,7,3),(6,10,11,7),(10,14,15,11),(0,2,3,1),(12,13,15,14)]
 mesh('Panoramic canopy',verts,faces,glass)
 cube('Roof spine',(0,.1,1.055),(.065,.48,.025),accent,bevel=.02)
 for side in [-1,1]:
  cube('Side sill',(side*.87,.02,.29),(.07,1.14,.07),ink,bevel=.025)
  cube('Mirror',(side*.84,-.42,.83),(.11,.11,.055),accent,bevel=.04)
  cube('Headlamp',(side*.49,-1.64,.53),(.23,.035,.045),light,bevel=.025)
  cube('Rear lamp',(side*.5,1.56,.53),(.23,.025,.035),rear,bevel=.018)
  cube('Spoiler mount',(side*.56,1.2,.8),(.035,.1,.16),ink,bevel=.015)
  for y in [-1.02,.99]:
   suffix=('L' if side<0 else 'R')+('F' if y<0 else 'B');x=side*.85
   tire=torus('Tire '+suffix,(x,y,.4),.285,.105,rubber,(0,math.pi/2,0));tire['wheel']=suffix
   cylinder('Wheel barrel '+suffix,(x,y,.4),.22,.18,ink,(0,math.pi/2,0))
   cylinder('Wheel hub '+suffix,(side*.96,y,.4),.065,.035,silver,(0,math.pi/2,0))
   for i in range(5):
    a=i*TAU/5;spoke=cube('Alloy spoke '+suffix,(side*.96,y+math.cos(a)*.12,.4+math.sin(a)*.12),(.018,.13,.025),silver,bevel=.012);rotate(spoke,0,a)
   cube('Brake caliper '+suffix,(side*.95,y-.14,.42),(.025,.055,.09),red,bevel=.02)
   path=[(side*.85,y+math.cos(a)*.43,.4+math.sin(a)*.43) for a in [j*math.pi/8 for j in range(9)]]
   tube('Wheel arch '+suffix,path,[.045]*9,accent,sides=8)
 cube('Rear wing',(0,1.22,.98),(.98,.18,.035),accent,bevel=.025)
 for i in range(5):cube('Grille fin',((i-2)*.15,-1.713,.37),(.045,.014,.055),ink,bevel=.009)
 for side in [-1,1]:cylinder('Boost exhaust',(side*.38,1.59,.34),.09,.12,silver,(math.pi/2,0,0));cylinder('Exhaust recess',(side*.38,1.665,.34),.065,.015,ink,(math.pi/2,0,0))
 return None

def surface_detail():
 for m in list(bpy.data.materials):
  if not m.use_nodes:continue
  p=m.node_tree.nodes.get('Principled BSDF')
  if not p:continue
  if any(word in m.name for word in ['Eye','Iris','Lash','LED','Core glow','Catchlight']):continue
  nodes=m.node_tree.nodes;links=m.node_tree.links
  noise=nodes.new('ShaderNodeTexNoise');noise.inputs['Scale'].default_value=105 if 'fabric' in m.name.lower() or 'Woven' in m.name else 65;noise.inputs['Detail'].default_value=2
  ramp=nodes.new('ShaderNodeValToRGB');ramp.color_ramp.elements[0].position=.15;ramp.color_ramp.elements[0].color=(.72,.72,.72,1);ramp.color_ramp.elements[1].position=.85;ramp.color_ramp.elements[1].color=(1,1,1,1);links.new(noise.outputs['Fac'],ramp.inputs[0])
  multiply=nodes.new('ShaderNodeMixRGB');multiply.blend_type='MULTIPLY';multiply.inputs[0].default_value=1;multiply.inputs[1].default_value=p.inputs['Base Color'].default_value;links.new(ramp.outputs['Color'],multiply.inputs[2]);links.new(multiply.outputs[0],p.inputs['Base Color'])
  rough=nodes.new('ShaderNodeMapRange');rough.inputs['To Min'].default_value=max(.08,p.inputs['Roughness'].default_value-.08);rough.inputs['To Max'].default_value=min(1,p.inputs['Roughness'].default_value+.08);links.new(noise.outputs['Fac'],rough.inputs[0]);links.new(rough.outputs[0],p.inputs['Roughness'])
  bump=nodes.new('ShaderNodeBump');bump.inputs['Strength'].default_value=.16;bump.inputs['Distance'].default_value=.003 if 'Woven' in m.name or 'fabric' in m.name.lower() else .001;links.new(noise.outputs['Fac'],bump.inputs['Height']);links.new(bump.outputs[0],p.inputs['Normal'])

def prepare_mesh(slug,rig):
 for part in parts:
  bm=bmesh.new();bm.from_mesh(part.data);bmesh.ops.remove_doubles(bm,verts=bm.verts[:],dist=.000001);bmesh.ops.dissolve_degenerate(bm,edges=bm.edges[:],dist=.000001);bmesh.ops.recalc_face_normals(bm,faces=bm.faces[:]);bm.to_mesh(part.data);bm.free()
 bpy.ops.object.select_all(action='DESELECT')
 for o in parts:o.select_set(True)
 bpy.context.view_layer.objects.active=parts[0];bpy.context.scene.cursor.location=(0,0,0);bpy.ops.object.origin_set(type='ORIGIN_CURSOR');bpy.ops.object.join();o=bpy.context.object;o.name='Game_Mesh'
 bpy.ops.object.transform_apply(location=True,rotation=True,scale=True)
 bm=bmesh.new();bm.from_mesh(o.data);bmesh.ops.recalc_face_normals(bm,faces=bm.faces[:]);bm.to_mesh(o.data);bm.free()
 bpy.ops.object.mode_set(mode='EDIT');bpy.ops.mesh.select_all(action='SELECT');bpy.ops.uv.smart_project(angle_limit=math.radians(65),island_margin=.012,area_weight=.4,scale_to_bounds=True);bpy.ops.uv.pack_islands(rotate=True,margin=.012);bpy.ops.object.mode_set(mode='OBJECT')
 o.data.uv_layers.active.name='UV_Atlas'
 # Mark actual UV boundaries as seams, including sharp changes in the unwrap.
 bm=bmesh.new();bm.from_mesh(o.data);uv=bm.loops.layers.uv.active
 for edge in bm.edges:
  if not edge.is_manifold:edge.seam=True;continue
  loops=edge.link_loops
  if len(loops)==2:
   a,b=loops;edge.seam=(a[uv].uv-b.link_loop_next[uv].uv).length>1e-5 or (a.link_loop_next[uv].uv-b[uv].uv).length>1e-5
 bm.to_mesh(o.data);bm.free()
 tri=o.modifiers.new('Export triangulation','TRIANGULATE');tri.keep_custom_normals=True;bpy.context.view_layer.objects.active=o;bpy.ops.object.modifier_apply(modifier=tri.name)
 bm=bmesh.new();bm.from_mesh(o.data);bmesh.ops.dissolve_degenerate(bm,edges=bm.edges[:],dist=0.000001);bmesh.ops.recalc_face_normals(bm,faces=bm.faces[:]);bm.to_mesh(o.data);bm.free()
 return o

def bake_atlas(o,out,texture_folder='textures'):
 texture_dir=out/'models'/texture_folder;texture_dir.mkdir(parents=True,exist_ok=True);scene=bpy.context.scene;scene.render.engine='CYCLES';scene.cycles.samples=12;scene.render.bake.margin=6
 slots=[m for m in o.data.materials if m];accent_indices={i for i,m in enumerate(o.data.materials) if m and m.name.startswith('Accent')};accent_polys={p.index for p in o.data.polygons if p.material_index in accent_indices}
 original_links={};metal_values={}
 for m in slots:
  p=m.node_tree.nodes.get('Principled BSDF');metal_values[m.name]=p.inputs['Metallic'].default_value if p else 0
 def image(name,kind):
  im=bpy.data.images.new(name,width=512,height=512,alpha=False);im.colorspace_settings.name='sRGB' if kind=='DIFFUSE' else 'Non-Color'
  for m in slots:
   node=m.node_tree.nodes.new('ShaderNodeTexImage');node.name='Bake_Target';node.image=im;m.node_tree.nodes.active=node
  bpy.context.view_layer.objects.active=o;bpy.ops.object.select_all(action='DESELECT');o.select_set(True)
  if kind=='DIFFUSE':bpy.ops.object.bake(type='DIFFUSE',pass_filter={'COLOR'},use_clear=True)
  else:bpy.ops.object.bake(type=kind,use_clear=True)
  im.filepath_raw=str(texture_dir/(name+'.png'));im.file_format='PNG';im.save()
  for m in slots:
   node=m.node_tree.nodes.get('Bake_Target')
   if node:m.node_tree.nodes.remove(node)
  return im
 print('BAKE base colour',flush=True);base=image('basecolor','DIFFUSE');print('BAKE tangent normals',flush=True);normal=image('normal','NORMAL');print('BAKE roughness',flush=True);rough=image('roughness','ROUGHNESS');print('BAKE ambient occlusion',flush=True);ao=image('occlusion','AO')
 # Bake scalar metal values through emission, then restore the original surface links.
 for m in slots:
  output=next(n for n in m.node_tree.nodes if n.type=='OUTPUT_MATERIAL');original_links[m.name]=(output.inputs['Surface'].links[0].from_socket,output.inputs['Surface']);em=m.node_tree.nodes.new('ShaderNodeEmission');em.name='Bake_Metal';v=metal_values[m.name];em.inputs[0].default_value=(v,v,v,1);m.node_tree.links.new(em.outputs[0],output.inputs['Surface'])
 metal=image('metallic','EMIT')
 for m in slots:
  a,b=original_links[m.name];m.node_tree.links.new(a,b);m.node_tree.nodes.remove(m.node_tree.nodes['Bake_Metal'])
 orm=bpy.data.images.new('ORM packed',width=512,height=512,alpha=False);orm.colorspace_settings.name='Non-Color';r=list(rough.pixels);a=list(ao.pixels);mt=list(metal.pixels);pixels=[0.0]*len(r)
 for i in range(0,len(r),4):pixels[i]=a[i];pixels[i+1]=r[i];pixels[i+2]=mt[i];pixels[i+3]=1
 orm.pixels=pixels;orm.filepath_raw=str(texture_dir/'orm.png');orm.file_format='PNG';orm.save()
 atlas=material('PBR_Atlas',(1,1,1),.65);nodes=atlas.node_tree.nodes;links=atlas.node_tree.links;p=nodes.get('Principled BSDF')
 b=nodes.new('ShaderNodeTexImage');b.image=base;b.label='sRGB base colour';links.new(b.outputs['Color'],p.inputs['Base Color'])
 n=nodes.new('ShaderNodeTexImage');n.image=normal;n.label='Tangent normals';normal_map=nodes.new('ShaderNodeNormalMap');normal_map.inputs['Strength'].default_value=.7;links.new(n.outputs['Color'],normal_map.inputs['Color']);links.new(normal_map.outputs[0],p.inputs['Normal'])
 ormnode=nodes.new('ShaderNodeTexImage');ormnode.image=orm;sep=nodes.new('ShaderNodeSeparateColor');links.new(ormnode.outputs['Color'],sep.inputs[0]);links.new(sep.outputs['Green'],p.inputs['Roughness']);links.new(sep.outputs['Blue'],p.inputs['Metallic'])
 group=bpy.data.node_groups.new('glTF Material Output','ShaderNodeTree');group.interface.new_socket(name='Occlusion',in_out='INPUT',socket_type='NodeSocketFloat');gn=nodes.new('ShaderNodeGroup');gn.node_tree=group;links.new(sep.outputs['Red'],gn.inputs['Occlusion'])
 accent=atlas.copy();accent.name='Accent';o.data.materials.clear();o.data.materials.append(atlas);o.data.materials.append(accent)
 for poly in o.data.polygons:poly.material_index=1 if poly.index in accent_polys else 0
 return atlas

def validate(o,slug):
 bm=bmesh.new();bm.from_mesh(o.data);nonmanifold=sum(not e.is_manifold for e in bm.edges);ngons=sum(len(f.verts)>4 for f in bm.faces);zero=sum(f.calc_area()<1e-10 for f in bm.faces);uv=bm.loops.layers.uv.active;outside=sum(any(v<-.0001 or v>1.0001 for v in loop[uv].uv) for face in bm.faces for loop in face.loops);seams=sum(e.seam for e in bm.edges);tris=sum(len(f.verts)-2 for f in bm.faces);bm.free()
 corners=[o.matrix_world@Vector(c) for c in o.bound_box];dims=[round(max(v[i] for v in corners)-min(v[i] for v in corners),3) for i in range(3)]
 result={'asset':slug,'revision':2,'tool':'Blender '+bpy.app.version_string,'vertices':len(o.data.vertices),'triangles':tris,'triangleBudget':18000,'materials':len(o.data.materials),'closedManifold':nonmanifold==0,'nonManifoldEdges':nonmanifold,'ngons':ngons,'zeroAreaFaces':zero,'uvAtlas':'UV_Atlas','uvOutsideTile':outside,'markedSeamEdges':seams,'dimensionsMeters':{'width':dims[0],'depth':dims[1],'height':dims[2]},'origin':'bottom-centre, world origin','blenderAxes':'Z-up, -Y forward','glTFExport':'Y-up, -Z forward','textureResolution':512,'textureChannels':['sRGB basecolor','tangent normal','packed occlusion/roughness/metallic'],'source':'blender/scene.blend','model':'models/hero.glb'}
 if nonmanifold or ngons or zero or outside or tris>18000:raise RuntimeError('Asset quality gate failed: '+json.dumps(result))
 return result

def studio(out,kind):
 global parts
 parts=[];base=material('Studio plinth',(.035,.048,.065),.4,.1);floor_mat=material('Studio ground',(.023,.032,.045),.85)
 size=2.3 if kind=='car' else 1.25;cylinder('Display plinth',(0,0,-.07),size,.12,base,vertices=64);cube('Studio floor',(0,0,-.18),(200,200,.05),floor_mat,bevel=0)
 for loc,power,size,color in [((3,-4,5),600,4,(1,.8,.64)),((-3,-2,3),450,3,(.62,.78,1)),((1,3,4),850,3,(.67,.9,1))]:
  bpy.ops.object.light_add(type='AREA',location=loc);light=bpy.context.object;light.data.energy=power;light.data.shape='DISK';light.data.size=size;light.data.color=color;light.rotation_euler=(Vector((0,0,.9))-light.location).to_track_quat('-Z','Y').to_euler()
 center=.55 if kind in ['car','plush'] else 1.05;ortho=5.5 if kind=='car' else 2.8 if kind=='plush' else 4.1
 bpy.ops.object.camera_add(location=(3.5,-6,2.9));cam=bpy.context.object;cam.rotation_euler=(Vector((0,0,center))-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.type='ORTHO';cam.data.ortho_scale=ortho
 scene=bpy.context.scene;scene.camera=cam;scene.world.use_nodes=True;scene.world.node_tree.nodes['Background'].inputs[0].default_value=(.12,.16,.21,1);scene.world.node_tree.nodes['Background'].inputs[1].default_value=.35;scene.render.engine='CYCLES';scene.cycles.samples=32;scene.cycles.use_denoising=True;scene.render.resolution_x=1000;scene.render.resolution_y=750;scene.render.resolution_percentage=100;scene.view_settings.view_transform='AgX';scene.render.image_settings.file_format='PNG';scene.render.filepath=str(out/'assets/model-render.png');bpy.ops.render.render(write_still=True)

CONFIG=[('nova-duel','fighter'),('boost-circuit','car'),('voxel-trails','voxel'),('patchwork-planet','plush'),('rift-arena','arena')]
if __name__=='__main__':
 stats={}
 for slug,kind in CONFIG:
  print('BUILD REVISION 2 '+slug,flush=True);bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
  for material_data in list(bpy.data.materials):bpy.data.materials.remove(material_data)
  collection=bpy.data.collections.new(slug.replace('-','_').title()+'_Game_Assets');bpy.context.scene.collection.children.link(collection);bpy.context.view_layer.active_layer_collection=bpy.context.view_layer.layer_collection.children[collection.name]
  bpy.context.scene.unit_settings.system='METRIC';bpy.context.scene.unit_settings.scale_length=1;parts=[];out=ROOT/slug
  for folder in ['models','assets','blender']:(out/folder).mkdir(parents=True,exist_ok=True)
  rig=hero(kind=='arena') if kind in ['fighter','arena'] else car() if kind=='car' else explorer() if kind=='voxel' else plush();surface_detail();o=prepare_mesh(slug,rig);bake_atlas(o,out);stats[slug]=validate(o,slug)
  bpy.ops.object.select_all(action='DESELECT');o.select_set(True)
  if rig:rig.select_set(True)
  bpy.context.view_layer.objects.active=o;bpy.ops.export_scene.gltf(filepath=str(out/'models/hero.glb'),export_format='GLB',use_selection=True,export_yup=True,export_animations=False,export_skins=True)
  low=o.copy();low.data=o.data.copy();bpy.context.collection.objects.link(low);low.name='Game_Mesh_LOD1';bpy.ops.object.select_all(action='DESELECT');low.select_set(True);bpy.context.view_layer.objects.active=low;mod=low.modifiers.new('Distance LOD','DECIMATE');mod.ratio=.52;bpy.ops.object.modifier_apply(modifier=mod.name)
  if rig:rig.select_set(True)
  bpy.ops.export_scene.gltf(filepath=str(out/'models/hero-low.glb'),export_format='GLB',use_selection=True,export_yup=True,export_animations=False,export_skins=True);stats[slug]['lodTriangles']=sum(len(p.vertices)-2 for p in low.data.polygons);bpy.data.objects.remove(low,do_unlink=True)
  studio(out,kind);bpy.context.scene.render.filepath='//../assets/model-render.png';bpy.ops.wm.save_as_mainfile(filepath=str(out/'blender/scene.blend'));(out/'models/stats.json').write_text(json.dumps(stats[slug],indent=2));print('VALIDATED '+json.dumps(stats[slug]),flush=True)
 (ROOT/'model-build-stats.json').write_text(json.dumps(stats,indent=2));print('ALL REVISION 2 ASSETS COMPLETE',flush=True)

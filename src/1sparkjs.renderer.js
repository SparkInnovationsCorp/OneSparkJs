﻿((global) => {

     const OneSparkJs = {};

     //Rederer module
     OneSparkJs.Renderer = (() => {

          class Vertex {
               constructor(x = 0, y = 0, z = 0) {
                    this.x = x;
                    this.y = y;
                    this.z = z;
               }
          }

          //Renderable types
          const SortByEnum = {
               byPriority: 0,
               byDepth: 1
          }

          const SortByTypes = {
               byPriority: {
                    sortOnRegister: true,
                    sortOnRender: false,
                    compare: function (a, b) {
                         return a.Priority - b.Priority;
                    }
               },
               byDepth: {
                    sortOnRegister: true,
                    sortOnRender: true,
                    compare: function (a, b) {
                         return a.instance.orientation.z - b.instance.orientation.z;
                    }
               }
          }

          class RenderableType {

               constructor(properties = {}) {
                    this.id = $1S.Helper.newId();
                    this.stageProps = [];  //sub props
                    this.isActive = properties.isActive || true;


                    if (this.sortBy)
                         this.setRenderSort(this.sortBy);
                    else
                         this.setRenderSort(SortByEnum.byPriority);
               }

               setRenderSort = (sortByEnum) => {

                    if (sortByEnum == SortByEnum.byPriority) {
                         this.sortBy = OneSparkJs.Renderer.SortByTypes.byPriority;
                    }
                    if (sortByEnum == SortByEnum.byDepth) {
                         this.sortBy = OneSparkJs.Renderer.SortByTypes.byDepth;
                    }
               }

               registerProp(instance, properties = {}, priority = 100000) {

                    if ((!(instance instanceof OneSparkJs.Renderer2D.StagePropType)) && !(instance instanceof OneSparkJs.Renderer2DTransform.TransformType))
                         throw new Error("Not a StagePropType or TransformType component.");

                    instance._parent = this;

                    const newRegistration = {
                         instance: instance,
                         Properties: properties,
                         Priority: priority
                    };

                    this.stageProps.push(newRegistration);

                    if (this.sortBy.sortOnRegister) {
                         this.stageProps.sort(this.sortBy.compare);
                    }

                    if (instance.onRegister)
                         instance.onRegister();
               }

               getProp = (id) => {

                    const subPropsObj = this.stageProps.find(prop => prop.instance.id === id);

                    if (subPropsObj) {
                         return subPropsObj.instance;
                    }

                    return null;
               }

               destroyProp = (id) => {

                    const index = this.stageProps.findIndex(prop => prop.instance.id === id);

                    if (index !== -1) {
                         if (this.stageProps[index].onDestroy)
                              this.stageProps[index].onDestroy();

                         this.stageProps.splice(index, 1);
                         return true;
                    }

                    return false;
               }

               clearProps = () => {
                    for (var i = 0; i < this.stageProps.length; i++)
                         if (this.stageProps[i].onDestroy)
                              this.stageProps[i].onDestroy();

                    this.stageProps[i] = [];
               }

               raiseTickEvent (timeStamp, deltaTime) {

                    if (!this.isActive) return;

                    if (this.onTick)
                         this.onTick(timeStamp, deltaTime);

                    for (var i = 0; i < this.stageProps.length; i++)
                         this.stageProps[i].instance.raiseTickEvent(timeStamp, deltaTime);

               }

               raiseRenderEvent(context) {

                    if (!this.isActive) return;

                    if (this.onDraw)
                         this.onDraw(context);

                    if (this.stageProps.length > 0) {
                         if (this.sortBy.sortOnRender) {
                              this.stageProps.sort(this.sortBy.compare);
                         }

                         for (var i = 0; i < this.stageProps.length; i++)
                              if (this.stageProps[i].instance.raiseRenderEvent)
                                   this.stageProps[i].instance.raiseRenderEvent(context);
                    }


                    if (this.onPostDraw)
                         this.onPostDraw(context);
               }

               raiseResizeEvent(w, h) {
                    if (this.onResize)
                         this.onResize(w, h);

                    for (var i = 0; i < this.stageProps.length; i++)
                         this.stageProps[i].instance.raiseResizeEvent(this.width, this.height);
               }

               raiseDisposeEvent() {
                    if (this.stageProps.length > 0) {
                         for (var i = 0; i < this.stageProps.length; i++)
                              if (this.stageProps[i].instance.raiseDisposeEvent)
                                   this.stageProps[i].instance.raiseDisposeEvent();
                    }
                    if (this.onDispose)
                         this.onDispose();
               }

               raiseInitStageEvent() {
                    if (!this.isActive) return;

                    if (this.stageProps.length > 0) {
                         for (var i = 0; i < this.stageProps.length; i++) {

                              if (this._stage)
                                   this.stageProps[i]._stage = this._stage;

                              if (this.stageProps[i].instance.raiseInitStageEvent)
                                   this.stageProps[i].instance.raiseInitStageEvent();

                         }
                    }
                    if (this.onInitStage)
                         this.onInitStage();
               }

               raiseShowStageEvent() {
                    if (!this.isActive) return;

                    if (this.stageProps.length > 0) {
                         for (var i = 0; i < this.stageProps.length; i++) {

                              if (this._stage)
                                   this.stageProps[i]._stage = this._stage;

                              if (this.stageProps[i].instance.raiseShowStageEvent)
                                   this.stageProps[i].instance.raiseShowStageEvent();

                         }
                    }
                    if (this.onShowStage)
                         this.onShowStage();
               }

               raiseHideStageEvent() {

                    if (!this.isActive) return;

                    if (this.stageProps.length > 0) {
                         for (var i = 0; i < this.stageProps.length; i++)
                              if (this.stageProps[i].instance.raiseHideStageEvent)
                                   this.stageProps[i].instance.raiseHideStageEvent();
                    }
                    if (this.onHideStage)
                         this.onHideStage();
               }

          }

          class StageType extends RenderableType {
               constructor(name, properties = {}) {
                    super();

                    const size = $1S.Renderer.Canvas.getSize();
                    this.width = size.width;
                    this.height = size.height;

                    this.name = name;
                    $1S.Renderer.register(name, this);

                    if (this.onInit) this.onInit(properties);
               }

               registerProp = (instance, properties = {}, priority = 100000) => {

                    if (instance._stage) {
                         throw new Error("Object is already a member of another stage.");
                    }

                    instance._stage = this;

                    super.registerProp(instance, properties, priority);

                    instance.raiseInitStageEvent();

                    //if we are adding this to an active stage, initialize showStage
                    if (this.name == $1S.Renderer.getActiveName())
                         instance.raiseShowStageEvent();
               }

               raiseRenderEvent = (context) => {
                    if (!this.isActive) return;

                    context.clearRect(0, 0, this.width, this.height);

                    super.raiseRenderEvent(context);

                    $1S.Renderer.Canvas.publish();
               }

               raiseResizeEvent(w, h) {
                    this.width = w;
                    this.height = h;

                    super.raiseResizeEvent(w, h);
               }

          }

          class Extension extends $1S.Application.ExtensionType {

               stages = {};
               activeStageName = null;

               constructor() {
                    super(0);
               }

               onLoad = (appPath, properties, oncomplete) => {
                    OneSparkJs.Canvas.initialize(properties);
                    oncomplete()
               }

               getActiveName = () => {
                    return this.activeStageName;
               }

               register = (name, instance = null) => {
                    if (!name)
                         throw new Error("Invalid stage name.");

                    if (this.stages[name])
                         throw new Error("Stage already defined.");

                    if (instance == null || !(instance instanceof StageType))
                         throw new Error("Not a StageType.");

                    this.stages[name] = {
                         Name: name,
                         instance: instance,
                         SavedState: null
                    };
               }

               raiseResizeEvent = (w,h) => {
                    if (this.activeStageName == null) return;

                    const stage = this.stages[this.activeStageName];

                    if (!stage) return;

                    stage.instance.raiseResizeEvent(w, h);
               }

               raiseRenderEvent = () => {

                    if (this.activeStageName == null) return;

                    const stage = this.stages[this.activeStageName];

                    if (!stage) return;

                    const context = $1S.Renderer.Canvas.getContext();

                    stage.instance.raiseRenderEvent(context);
               }

               getStage = () => {
                    var stage = null;

                    if (this.activeStageName != null) {
                         stage = this.stages[this.activeStageName];
                    }

                    return stage;
               }

               destroy = (stageName = null) => {
                    stageName = stageName || this.activeStageName;

                    if (this.activeStageName === stageName) {
                         this.stages[this.activeStageName].raiseHideStageEvent();
                         this.activeStageName = null;
                    }

                    const stage = this.stages[stageName];

                    if (!stage) {
                         throw new Error("Stage not found.");
                    }

                    stage.raiseDisposeEvent();

                    stage.clearProps();

                    delete this.stages[stageName];
               }

               switchTo = (name) => {

                    if (this.activeStageName != null) {
                         this.stages[this.activeStageName].instance.raiseHideStageEvent();
                         this.stages[this.activeStageName].SavedState = $1S.Renderer.Canvas.getState();
                    }

                    if (name == null) {
                         this.activeStageName = null;
                         return;
                    }

                    if (!this.stages[name]) {
                         throw new Error(`Stage not found: ${name}`);
                    }

                    this.activeStageName = name;
                    if (this.stages[this.activeStageName].SavedState != null) {
                         if (this.stages[this.activeStageName].SavedState)
                              $1S.Renderer.Canvas.setState(this.stages[this.activeStageName].SavedState);
                    }

                    this.stages[this.activeStageName].instance.raiseShowStageEvent();

               }

               handleTickEvent = (timeStamp, deltaTime) => {
                    if (this.activeStageName) {
                         const stage = this.stages[this.activeStageName];
                         stage.instance.raiseTickEvent(timeStamp, deltaTime);
                    }
               }

               handlePostTickEvent = (timeStamp, deltaTime) => {
                    this.raiseRenderEvent();
               }

               reset = () => {

                    const stageNames = Object.keys(this.stages);

                    for (var i = 0; i < this.stagesNames.length; i++) {
                         destroy(stageNames[i]);
                    };

                    this.stages = {};
                    this.activeStageName = null;
               }

          }

          const Ext = new Extension();

          return { Vertex, RenderableType, SortByEnum, SortByTypes, StageType, Ext }
     })();

     //Rederer module
     OneSparkJs.Renderer2D = (() => {

          //stage prop types
          const AlignOnEnum = {
               Center: 0,     //drawn on parent using center coordinate
               UpperLeft: 1,  //drawn on parent using upper left coordinate (0,0)
               UpperRight: 2, //drawn on parent using upper right coordinate
               LowerLeft: 3,  //drawn on parent using lower left coordinate
               LowerRight: 4  //drawn on parent using lower right coordinate
          }

          class Orientation extends OneSparkJs.Renderer.Vertex {
               constructor(x = 0, y = 0, z = 0, alignment = AlignOnEnum.Center, xScale = 1, yScale = 1, rotation = 0) {
                    super(x, y, z);
                    this.rotation = rotation;
                    this.xScale = xScale;
                    this.yScale = yScale;
                    this.scaleToContainer = false;
                    this.alignment = alignment;
               }

               get alignment() {
                    return this._alignment;
               }

               set alignment(value) {
                    if (Object.values(AlignOnEnum).indexOf(value) === -1) {
                         throw new Error('Invalid alignment value');
                    }
                    this._alignment = value;
               }
          }

          class StagePropType extends OneSparkJs.Renderer.RenderableType {

               constructor(properties = {}, skipInit = false) {
                    super();

                    this.orientation = new Orientation(
                         properties.x || 0,
                         properties.y || 0,
                         properties.z || 0,
                         properties.alignment || AlignOnEnum.Center,
                         properties.xScale || 1,
                         properties.yScale || 1,
                         properties.rotation || 0
                    )

                    this.width = properties.width || 100;
                    this.height = properties.height || 100;
                    this.isVisible = properties.isVisible || true;

                    //get screen size
                    const size = $1S.Renderer.Canvas.getSize();
                    this.screenWidth = size.width;
                    this.screenHeight = size.height;

                    this.workCanvas = document.createElement('canvas');
                    this.workCanvas.width = this.width;
                    this.workCanvas.height = this.height;
                    this.workContext = this.workCanvas.getContext('2d')

                    if ((!skipInit) && this.onInit) this.onInit(properties);
               }

               registerProp = (instance, properties = {}, priority = 100000) => {

                    if (this._stage)
                         instance._stage = this._stage;

                    super.registerProp(instance, properties, priority);

                    if (this._stage) {
                         instance.raiseInitStageEvent();

                         //if we are adding this to an active stage, initialize showStage
                         if (instance._stage.name == $1S.Renderer.getActiveName())
                              instance.raiseShowStageEvent();
                    }

               }

               getRegion() {
                    const xScale = this.orientation.xScale;
                    const yScale = this.orientation.yScale;

                    switch (this.orientation.alignment) {
                         case AlignOnEnum.Center:
                              return {
                                   x1: this.orientation.x - this.width * xScale / 2,
                                   y1: this.orientation.y - this.height * yScale / 2,
                                   x2: this.orientation.x + this.width * xScale / 2,
                                   y2: this.orientation.y + this.height * yScale / 2
                              };
                              break;

                         case AlignOnEnum.UpperLeft:
                              return {
                                   x1: this.orientation.x,
                                   y1: this.orientation.y,
                                   x2: this.orientation.x + this.width * xScale,
                                   y2: this.orientation.y + this.height * yScale
                              };
                              break;

                         case AlignOnEnum.UpperRight:
                              return {
                                   x1: this.orientation.x - this.width * xScale,
                                   y1: this.orientation.y,
                                   x2: this.orientation.x,
                                   y2: this.orientation.y + this.height * yScale
                              };
                              break;

                         case AlignOnEnum.LowerLeft:
                              return {
                                   x1: this.orientation.x,
                                   y1: this.orientation.y - this.height * yScale,
                                   x2: this.orientation.x + this.width * xScale,
                                   y2: this.orientation.y
                              };
                              break;

                         case AlignOnEnum.LowerRight:
                              return {
                                   x1: this.orientation.x - this.width * xScale,
                                   y1: this.orientation.y - this.height * yScale,
                                   x2: this.orientation.x,
                                   y2: this.orientation.y
                              };
                              break;

                         default:
                              return {
                                   x1: this.orientation.x,
                                   y1: this.orientation.y,
                                   x2: this.orientation.x + this.width * xScale,
                                   y2: this.orientation.y + this.height * yScale
                              };
                              break;
                    }
               }

               setRegion(region) {

                    var regionWidth = Math.abs(region.x2 - region.x1);
                    var regionHeight = Math.abs(region.y2 - region.y1);

                    this.orientation.xScale = regionWidth / this.width;
                    this.orientation.yScale = regionHeight / this.height;

                    switch (this.orientation.alignment) {
                         case AlignOnEnum.Center:
                              this.orientation.x = region.x1 + ((region.x2 - region.x1) / 2);
                              this.orientation.y = region.y1 + ((region.y2 - region.y1) / 2);
                              break;
                         case AlignOnEnum.UpperLeft:
                              this.orientation.x = region.x1;
                              this.orientation.y = region.y1; 
                              break;
                         case AlignOnEnum.UpperRight:
                              this.orientation.x = region.x2;
                              this.orientation.y = region.y1;
                              break;
                         case AlignOnEnum.LowerLeft:
                              this.orientation.x = region.x1;
                              this.orientation.y = region.y2;
                              break;
                         case AlignOnEnum.LowerRight:
                              this.orientation.x = region.x2;
                              this.orientation.y = region.y2;
                              break;
                         default:
                              this.orientation.x = region.x1;
                              this.orientation.y = region.y1;
                              break;
                    }

               }

               show() {
                    this.isVisible = true;
               }

               hide() {
                    this.isVisible = false;
               }

               resize(w, h) {
                    this.width = w;
                    this.height = h;

                    this.workCanvas = document.createElement('canvas');
                    this.workCanvas.width = this.width;
                    this.workCanvas.height = this.height;
                    this.workContext = this.workCanvas.getContext('2d')

                    this.raiseResizeEvent(this._parent.width, this._parent.height);
               }

               raiseRenderEvent = (context) => {

                    if (!this.isActive) return;

                    if (!this.isVisible) return;

                    if (this.onDraw)
                         this.onDraw(this.workContext);

                    super.raiseRenderEvent(this.workContext);

                    if (this.onPostDraw)
                         this.onPostDraw(this.workContext);

                    const scaledWidth = this.width * this.orientation.xScale;
                    const scaledHeight = this.height * this.orientation.yScale;

                    if (this.orientation.rotation != 0) {
                         const rotationAngle = (Math.PI / 180) * this.orientation.rotation;

                         switch (this.orientation.alignment) {
                              case AlignOnEnum.Center:
                                   context.save();
                                   context.translate(this.orientation.x, this.orientation.y);
                                   context.rotate(rotationAngle);
                                   context.scale(this.orientation.xScale, this.orientation.yScale);
                                   context.translate(-(scaledWidth / 2), -(scaledHeight / 2));
                                   context.drawImage(this.workCanvas, 0, 0, this.width, this.height, 0, 0, scaledWidth, scaledHeight);
                                   context.restore();
                                   break;
                              case AlignOnEnum.UpperLeft:
                                   context.save();
                                   context.translate(this.orientation.x, this.orientation.y);
                                   context.rotate(rotationAngle);
                                   context.scale(this.orientation.xScale, this.orientation.yScale);
                                   context.drawImage(this.workCanvas, 0, 0, this.width, this.height, 0, 0, scaledWidth, scaledHeight);
                                   context.restore();
                                   break;
                              case AlignOnEnum.UpperRight:
                                   context.save();
                                   context.translate(this.orientation.x, this.orientation.y);
                                   context.rotate(rotationAngle);
                                   context.scale(this.orientation.xScale, this.orientation.yScale);
                                   context.translate(-scaledWidth, 0);
                                   context.drawImage(this.workCanvas, 0, 0, this.width, this.height, 0, 0, scaledWidth, scaledHeight);
                                   context.restore();
                                   break;
                              case AlignOnEnum.LowerLeft:
                                   context.save();
                                   context.translate(this.orientation.x, this.orientation.y);
                                   context.rotate(rotationAngle);
                                   context.scale(this.orientation.xScale, this.orientation.yScale);
                                   context.translate(0, -scaledHeight);
                                   context.drawImage(this.workCanvas, 0, 0, this.width, this.height, 0, 0, scaledWidth, scaledHeight);
                                   context.restore();
                                   break;
                              case AlignOnEnum.LowerRight:
                                   context.save();
                                   context.translate(this.orientation.x, this.orientation.y);
                                   context.rotate(rotationAngle);
                                   context.scale(this.orientation.xScale, this.orientation.yScale);
                                   context.translate(-scaledWidth, -scaledHeight);
                                   context.drawImage(this.workCanvas, 0, 0, this.width, this.height, 0, 0, scaledWidth, scaledHeight);
                                   context.restore();
                                   break;
                              default:
                                   context.save();
                                   context.translate(this.orientation.x, this.orientation.y);
                                   context.rotate(rotationAngle);
                                   context.scale(this.orientation.xScale, this.orientation.yScale);
                                   context.translate(-(scaledWidth / 2), -(scaledHeight / 2));
                                   context.drawImage(this.workCanvas, 0, 0, this.width, this.height, 0, 0, scaledWidth, scaledHeight);
                                   context.restore();
                         }
                    } else {
                         switch (this.orientation.alignment) {
                              case AlignOnEnum.Center:
                                   context.drawImage(
                                        this.workCanvas,
                                        0,
                                        0,
                                        this.width,
                                        this.height,
                                        this.orientation.x - (scaledWidth / 2),
                                        this.orientation.y - (scaledHeight / 2),
                                        scaledWidth,
                                        scaledHeight
                                   );
                                   break;
                              case AlignOnEnum.UpperLeft:
                                   context.drawImage(
                                        this.workCanvas,
                                        0,
                                        0,
                                        this.width,
                                        this.height,
                                        this.orientation.x,
                                        this.orientation.y,
                                        scaledWidth,
                                        scaledHeight
                                   );
                                   break;
                              case AlignOnEnum.UpperRight:
                                   context.drawImage(
                                        this.workCanvas,
                                        0,
                                        0,
                                        this.width,
                                        this.height,
                                        this.orientation.x,
                                        this.orientation.y - scaledHeight,
                                        scaledWidth,
                                        scaledHeight
                                   );
                                   break;
                              case AlignOnEnum.LowerLeft:
                                   context.drawImage(
                                        this.workCanvas,
                                        0,
                                        0,
                                        this.width,
                                        this.height,
                                        this.orientation.x - scaledWidth,
                                        this.orientation.y,
                                        scaledWidth,
                                        scaledHeight
                                   );
                                   break;
                              case AlignOnEnum.LowerRight:
                                   context.drawImage(
                                        this.workCanvas,
                                        0,
                                        0,
                                        this.width,
                                        this.height,
                                        this.orientation.x - scaledWidth,
                                        this.orientation.y - scaledHeight,
                                        scaledWidth,
                                        scaledHeight
                                   );
                                   break;
                              default:
                                   context.drawImage(
                                        this.workCanvas,
                                        0,
                                        0,
                                        this.width,
                                        this.height,
                                        this.orientation.x - (scaledWidth / 2),
                                        this.orientation.y - (scaledHeight / 2),
                                        scaledWidth,
                                        scaledHeight
                                   );
                         }

                    }

               }

          }

          class SpritePropType extends StagePropType {

               constructor(properties = {}) {
                    super(properties);

                    this.activeLoop = null;
                    this.spriteLoop = {};

                    this.frame = properties.frameStart || 0;
                    this.framesPerSecond = properties.framesPerSecond || 12;
                    this.frameTime = 1000 / this.framesPerSecond;

                    this.sizeChange = false;

                    this.renderedFrame = -1;
                    this.lastFrameUpdateTime = 0;

                    if (properties.groupName)
                         this.loadGroup(properties.groupName);

                    if (properties.imageName)
                         this.loadImage(properties.imageName, 1);

               }

               onInit(properties) {
               }

               onTick(timeStamp, deltaTime) {
                    if (this.activeLoop && this.isVisible && this.activeLoop.clipPaths.length > 1) {
                         const timeSinceLastFrameUpdate = timeStamp - this.lastFrameUpdateTime;
                         if (timeSinceLastFrameUpdate >= this.frameTime) {
                              this.lastFrameUpdateTime = timeStamp;
                              this.frame++;
                              if (this.frame >= this.activeLoop.clipPaths.length) {
                                   this.frame = 0;
                              }
                         }
                    }
               }

               onDraw(context) {
                    if (this.activeLoop && this.isVisible && this.frame != this.renderedFrame) {
                         const groupCanvas = this.activeLoop.clipPaths[this.frame].Canvas;
                         const groupContext = this.activeLoop.clipPaths[this.frame].CanvasContext;

                         context.clearRect(0, 0, this.width, this.height);
                         context.drawImage(groupCanvas, 0, 0);

                         this.renderedFrame = this.frame;
                    }
               }

               loadGroup(loopName) {
                    if (!loopName)
                         throw new Error("A sprite group is required.")

                    const loop = $1S.Assets.getSpriteLoop(loopName);

                    if (!loop)
                         throw new Error(`Sprite group ${loopName} not found.`)

                    this.adjustCanvas(loop);

                    this.spriteLoop[loopName] = loop;

                    if (!this.activeLoop) {
                         this.activeLoop = loop;
                    };
               }

               loadImage(imageName, frameCount) {
                    if (!imageName)
                         throw new Error("An image is required.")

                    const image = $1S.Assets.getImage(imageName);

                    if (!image)
                         throw new Error(`Sprite image ${imageName} not found.`)

                    const group = {
                         group: imageName,
                         clipPaths: []
                    }

                    for (var i = 0; i < frameCount; i++) {
                         group.clipPaths.push({
                              Canvas: image.Canvas,
                              CanvasContext: image.CanvasContext
                         });
                    }

                    this.adjustCanvas(group);

                    this.spriteLoop[imageName] = group;

                    if (!this.activeLoop) {
                         this.activeLoop = group;
                    };
               }

               show(groupName) {

                    var group = this.spriteLoop[groupName];

                    if (!group) {
                         this.loadGroup(groupName)
                         group = this.spriteLoop[groupName];
                    }

                    this.frame = 0;
                    this.activeLoop = group;
               }

               adjustCanvas(group) {

                    var changeSize = false;

                    for (var i = 0; i < group.clipPaths.length; i++) {
                         if (this.width < group.clipPaths[i].Canvas.width) {
                              this.width = group.clipPaths[i].Canvas.width;
                              changeSize = true;
                         }

                         if (this.height < group.clipPaths[i].Canvas.height) {
                              this.height = group.clipPaths[i].Canvas.height;
                              changeSize = true;
                         }
                    }

                    if (changeSize) {
                         this.workCanvas.width = this.width;
                         this.workCanvas.height = this.height;
                         this.workContext = this.workCanvas.getContext('2d');
                    }

               }

          }

          class TilesetPropType extends StagePropType {

               constructor(layoutName, properties = {}) {
                    super(properties);

                    if (!layoutName)
                         throw new Error(`Layout name invalid.`)

                    this.layoutName = layoutName;

                    this.tiles = [];

                    this.initialize();
               }

               initialize() {
                    var layout = $1S.Assets.getTileset(this.layoutName);

                    if (!layout)
                         throw new Error(`Layout ${layoutName} not found.`)

                    for (var i = 0; i < layout.tiles.length; i++) {
                         const tile = layout.tiles[i];

                         const sprite = new SpritePropType(
                              {
                                   imageName: tile.imageName,
                                   groupName: tile.groupName,
                                   framesPerSecond: tile.frameRate || 0,
                                   framesStart: tile.frameStart || 0,
                                   x: tile.x || 0,
                                   y: tile.y || 0,
                                   alignOn: tile.alignOn || AlignOnEnum.UpperLeft
                              });

                         this.registerProp(sprite);

                    };

               }

          }

          return { AlignOnEnum, Orientation, StagePropType, SpritePropType, TilesetPropType }
     })();

     //Rederer module
     OneSparkJs.Renderer2DTransform = (() => {

          //prop transforms
          class TransformType {

               constructor(parent, child, properties) {
                    this.id = $1S.Helper.newId();

                    this.parent = parent;

                    this.child = child;
                    this.childRegion = this.child.getRegion();

                    this.child._parent == this.parent;

                    if (this.parent instanceof OneSparkJs.Renderer.StageType)
                         this.child._stage == this.parent;
                    else
                         this.child._stage == this.parent._stage;

                    if (this.onInit) this.onInit(properties);
               }

               raiseTickEvent(timeStamp, deltaTime) {

                    if (this.onTick)
                         this.onTick(timeStamp, deltaTime);

                    this.child.raiseTickEvent(timeStamp, deltaTime);
               }

               raiseRenderEvent(context) {

                    if (this.onDraw)
                         this.onDraw(context);

                    this.child.raiseRenderEvent(context);
               }

               raiseResizeEvent(w, h) {

                    if (this.onResize)
                         this.onResize(w, h);

                    this.child.raiseResizeEvent(w, h);
               }

               raiseDisposeEvent() {

                    if (this.onDispose)
                         this.onDispose(w, h);

                    this.child.raiseDisposeEvent();
               }

               raiseInitStageEvent() {
                    if (this.parent instanceof OneSparkJs.Renderer.StageType)
                         this.child._stage == this.parent;
                    else
                         this.child._stage == this.parent._stage;

                    if (this.onInitStage)
                         this.onInitStage();

                    this.child.raiseInitStageEvent();
               }

               raiseShowStageEvent() {
                    if (this.parent instanceof OneSparkJs.Renderer.StageType)
                         this.child._stage == this.parent;
                    else
                         this.child._stage == this.parent._stage;

                    this.child.raiseShowStageEvent();
               }

               raiseHideStageEvent() {
                    this.child.raiseHideStageEvent();
               }

          }

          const AnchorTypeEnum = {
               None: 0,
               Absolute: 1,
               Relative: 2,
               Centered: 3
          };

          class AnchorTransformType extends TransformType {

               onInit(properties) {
                    this.anchorLeft = properties.anchorLeft || AnchorTypeEnum.None;
                    this.anchorLeftValue = properties.anchorLeftValue || 0;
                    this.anchorRight = properties.anchorRight || AnchorTypeEnum.None;
                    this.anchorRightValue = properties.anchorRightValue || 0;
                    this.anchorTop = properties.anchorTop || AnchorTypeEnum.None;
                    this.anchorTopValue = properties.anchorTopValue || 0;
                    this.anchorBottom = properties.anchorBottom || AnchorTypeEnum.None;
                    this.anchorBottomValue = properties.anchorBottomValue || 0;
                    this.keepAspectRatio = properties.keepAspectRatio || false;

                    this.updateRegion();
               }

               onInitStage() {
                    this.updateRegion();
               }

               onResize() {
                    this.updateRegion();
               }

               updateRegion() {
                    var childWidth = this.child.width * this.child.orientation.xScale;
                    var childHeight = this.child.height * this.child.orientation.yScale;
                    const childRatio = childWidth / childHeight;

                    //left
                    if (this.anchorLeft == AnchorTypeEnum.Absolute) {
                         this.childRegion.x1 = this.anchorLeftValue;

                         if (this.anchorRight == AnchorTypeEnum.None)
                              this.childRegion.x2 = this.childRegion.x1 + childWidth;
                    }
                    else if (this.anchorLeft == AnchorTypeEnum.Relative) {
                         this.childRegion.x1 = this.parent.width * (this.anchorLeftValue / 100);

                         if (this.anchorRight == AnchorTypeEnum.None)
                              this.childRegion.x2 = this.childRegion.x1 + childWidth;
                    }
                    else if (this.anchorLeft == AnchorTypeEnum.Centered) {
                         this.childRegion.x1 = ((this.parent.width / 2) - (childWidth / 2)) - this.anchorLeftValue;

                         if (this.anchorRight == AnchorTypeEnum.None)
                              this.childRegion.x2 = this.childRegion.x1 + childWidth;
                    }

                    //right
                    if (this.anchorRight == AnchorTypeEnum.Absolute) {
                         this.childRegion.x2 = this.parent.width - this.anchorRightValue;

                         if (this.anchorLeft == AnchorTypeEnum.None)
                              this.childRegion.x1 = this.childRegion.x2 - childWidth;
                    }
                    else if (this.anchorRight == AnchorTypeEnum.Relative) {
                         this.childRegion.x2 = this.parent.width - (this.parent.width * (this.anchorRightValue / 100));

                         if (this.anchorLeft == AnchorTypeEnum.None)
                              this.childRegion.x1 = this.childRegion.x2 - childWidth;
                    }
                    else if (this.anchorRight == AnchorTypeEnum.Centered) {
                         this.childRegion.x2 = (this.parent.width - ((this.parent.width / 2) - (childWidth / 2))) + this.anchorRightValue;

                         if (this.anchorLeft == AnchorTypeEnum.None)
                              this.childRegion.x1 = this.childRegion.x2 - childWidth;
                    }

                    if (this.keepAspectRatio && this.anchorLeft != AnchorTypeEnum.None && this.anchorRight != AnchorTypeEnum.None) {

                         childWidth = Math.abs(this.childRegion.x2 - this.childRegion.x1);
                         childHeight = childWidth / childRatio;
                    }

                    //top
                    if (this.anchorTop == AnchorTypeEnum.Absolute) {
                         this.childRegion.y1 = this.anchorTopValue;

                         if (this.anchorBottom == AnchorTypeEnum.None) {
                              this.childRegion.y2 = this.childRegion.y1 + childHeight;
                         }
                    } else if (this.anchorTop == AnchorTypeEnum.Relative) {
                         this.childRegion.y1 = this.parent.height * (this.anchorTopValue / 100);
                         if (this.anchorBottom == AnchorTypeEnum.None) {
                              this.childRegion.y2 = this.childRegion.y1 + childHeight;
                         }
                    } else if (this.anchorTop == AnchorTypeEnum.Centered) {
                         this.childRegion.y1 = ((this.parent.height / 2) - (childHeight / 2)) - this.anchorTopValue;
                         if (this.anchorBottom == AnchorTypeEnum.None) {
                              this.childRegion.y2 = this.childRegion.y1 + childHeight;
                         }
                    }

                    //bottom
                    if (this.anchorBottom == AnchorTypeEnum.Absolute) {

                         this.childRegion.y2 = this.parent.height - this.anchorBottomValue;

                         if (this.anchorTop == AnchorTypeEnum.None) {
                              this.childRegion.y1 = this.childRegion.y2 - childHeight;
                         }

                    } else if (this.anchorBottom == AnchorTypeEnum.Relative) {
                         this.childRegion.y2 = this.parent.height - (this.parent.height * (this.anchorBottomValue / 100));
                         if (this.anchorTop == AnchorTypeEnum.None) {
                              this.childRegion.y1 = this.childRegion.y2 - childHeight;
                         }
                    } else if (this.anchorBottom == AnchorTypeEnum.Centered) {

                         console.log(this.parent.height, childHeight);

                         this.childRegion.y2 = ((this.parent.height / 2)-(childHeight / 2)) + this.anchorBottomValue;
                         if (this.anchorTop == AnchorTypeEnum.None) {
                              this.childRegion.y1 = this.childRegion.y2 - childHeight;
                         }
                    }

                    if (this.anchorLeft != AnchorTypeEnum.None && this.anchorRight != AnchorTypeEnum.None &&
                         this.anchorTop != AnchorTypeEnum.None && this.anchorBottom != AnchorTypeEnum.None) {

                         childWidth = Math.abs(this.childRegion.x2 - this.childRegion.x1);
                         childHeight = Math.abs(this.childRegion.x2 - this.childRegion.x1);
                    }
                    else if (this.keepAspectRatio && this.anchorTop != AnchorTypeEnum.None && this.anchorBottom != AnchorTypeEnum.None) {

                         childHeight = Math.abs(this.childRegion.x2 - this.childRegion.x1);
                         childWidth = childRatio * childHeight;
                    }

                    console.log("setting region", this.childRegion);

                    this.child.setRegion(this.childRegion);

               }

          }

          return { TransformType, AnchorTypeEnum, AnchorTransformType }
     })();

     // Graphics module
     OneSparkJs.Canvas = (() => {

          let width = 0;
          let height = 0;
          let fullWindow = false;

          let canvas2D = null;
          let context2D = null;
          let workCanvas2D = null;
          let workContext2D = null;

          let canvas3D = null;
          let context3D = null;
          let threeSupport = false;
          let threeRenderer = null;


          let glContext = null;

          const initialize = (properties) => {

               var targetDiv = null;

               threeSupport = properties.threeSupport || false;

               if (properties.target) {

                    // Find the div element by its name
                    targetDiv = document.getElementById(properties.target);

                    if (!targetDiv) {
                         alert(`${properties.canvas} not found.  Either create, or remove from configuration.`);
                    }

                    //make sure it has a css position set
                    const computedStyle = window.getComputedStyle(targetDiv);
                    const currentPosition = computedStyle.getPropertyValue('position');

                    if (currentPosition === 'static') {
                         targetDiv.style.position = 'relative';
                    }

                    const aspectRatio = properties.aspectRatio || "16:9";
                    const [aspectWidth, aspectHeight] = aspectRatio.split(':');
                    width = targetDiv.clientWidth;
                    height = (width / aspectWidth) * aspectHeight;

               } else {
                    targetDiv = document.body;
                    width = window.innerWidth;
                    height = window.innerHeight;
               }

               if (threeSupport)
               {
                    //3D canvas
                    canvas3D = document.createElement('canvas');
                    canvas3D.id = '1spark3D';
                    canvas3D.width = width; // Set the desired width
                    canvas3D.height = height; // Set the desired height

                    targetDiv.appendChild(canvas3D);

                    context3D = canvas3D.getContext("webgl");

                    if (!context3D) {
                         console.log("Could not initialize WebGL");
                    } else {
                         context3D.viewportWidth = canvas3D.width;
                         context3D.viewportHeight = canvas3D.height;
                    }
               }

               //2D canvas
               canvas2D = document.createElement('canvas');
               canvas2D.id = '1spark2D';
               canvas2D.width = width; // Set the desired width
               canvas2D.height = height; // Set the desired height

               if (threeSupport) {
                    canvas2D.style.position = 'absolute';
                    canvas2D.style.top = '0';
                    canvas2D.style.left = '0';
               }

               targetDiv.appendChild(canvas2D);

               context2D = canvas2D.getContext("2d");

               if (!context2D) {
                    console.log("Could not initialize 2D");
               } else {
                    //2D work canvas
                    workCanvas2D = document.createElement('canvas');
                    workCanvas2D.width = canvas2D.width;
                    workCanvas2D.height = canvas2D.height;
                    workContext2D = workCanvas2D.getContext('2d');
               }

               //if (fullWindow) {
               //     if (document.documentElement.requestFullscreen) {
               //          document.documentElement.requestFullscreen();
               //     } else if (document.documentElement.mozRequestFullScreen) { // Firefox
               //          document.documentElement.mozRequestFullScreen();
               //     } else if (document.documentElement.webkitRequestFullscreen) { // Chrome, Safari, Opera
               //          document.documentElement.webkitRequestFullscreen();
               //     } else if (document.documentElement.msRequestFullscreen) { // IE/Edge
               //          document.documentElement.msRequestFullscreen();
               //     }
               //}

                //Add an event listener to detect canvas resizing
               window.addEventListener('resize', () => {

                    if (canvas2D.width != width && canvas2D.height != height) {

                         width = canvas2D.width;
                         height = canvas2D.height;

                         //2D canvas
                         context2D = canvas2D.getContext("2d");

                         if (!context2D) {
                              console.log("Could not initialize 2D");
                         } else {
                              //2D work canvas
                              workCanvas2D = document.createElement('canvas');
                              workCanvas2D.width = canvas2D.width;
                              workCanvas2D.height = canvas2D.height;
                              workContext2D = workCanvas2D.getContext('2d');
                         }

                         if (threeSupport) {
                              canvas3D.width = width; // Set the desired width
                              canvas3D.height = height; // Set the desired height

                              if (threeRenderer)
                                   threeRenderer.setSize(width, height);
                         }

                         OneSparkJs.Renderer.Ext.raiseResizeEvent(canvas2D.width, canvas2D.height);
                    }
               });
          }

          const getStyle = () => {
               return canvas2D.style;
          }

          const getSize = () => {
               return {
                    width: canvas2D.width,
                    height: canvas2D.height
               }
          }

          const getContext = () => {
               return workContext2D;
          }

          const getThreeRenderer = () => {
               if (threeSupport) {
                    if (!threeRenderer) {
                         threeRenderer = new THREE.WebGLRenderer({ context: context3D });
                         threeRenderer.setSize(canvas3D.width, canvas3D.height);
                    }
                    return threeRenderer;
               }

               throw new Error("Three support not initialized.");
          }

          const publish = () => {
               context2D.clearRect(0, 0, canvas2D.width, canvas2D.height);
               context2D.drawImage(workCanvas2D, 0, 0);
          }

          const setState = (savedState) => {
               // Clear the canvas
               context2D.clearRect(0, 0, canvas2D.width, canvas2D.height);

               // Restore the saved state of the canvas
               const img = new Image();
               img.onload = function () {
                    context2D.drawImage(img, 0, 0);
               };
               img.src = savedState;
          }

          const getState = () => {
               // Save the current state of the canvas
               const savedState = canvas2D.toDataURL();

               return savedState;
          }

          //still experimental
          const setFullScreen = (fullScreenMode) => {
               if (fullScreenMode) {
                    if (document.documentElement.requestFullscreen) {
                         document.documentElement.requestFullscreen();
                    } else if (document.documentElement.mozRequestFullScreen) { // Firefox
                         document.documentElement.mozRequestFullScreen();
                    } else if (document.documentElement.webkitRequestFullscreen) { // Chrome, Safari, Opera
                         document.documentElement.webkitRequestFullscreen();
                    } else if (document.documentElement.msRequestFullscreen) { // IE/Edge
                         document.documentElement.msRequestFullscreen();
                    }
               } else {
                    if (document.exitFullscreen) {
                         document.exitFullscreen();
                    } else if (document.mozCancelFullScreen) { // Firefox
                         document.mozCancelFullScreen();
                    } else if (document.webkitExitFullscreen) { // Chrome, Safari, Opera
                         document.webkitExitFullscreen();
                    } else if (document.msExitFullscreen) { // IE/Edge
                         document.msExitFullscreen();
                    }
               }
          }

          return {
               initialize,
               setFullScreen,
               getContext,
               getThreeRenderer,
               publish,
               getState,
               setState,
               getStyle,
               getSize
          }

     })();

     // Public API
     global.$1S.Renderer = {
          Type: {
               Vertex: OneSparkJs.Renderer.Vertex,
               SortBy: OneSparkJs.Renderer.SortByEnum,
               Stage: OneSparkJs.Renderer.StageType,
               Render2D: {
                    AlignOn: OneSparkJs.Renderer2D.AlignOnEnum,
                    Orientation: OneSparkJs.Renderer2D.Orientation,
                    Prop: OneSparkJs.Renderer2D.StagePropType,
                    Sprite: OneSparkJs.Renderer2D.SpritePropType,
                    Tileset: OneSparkJs.Renderer2D.TilesetPropType,
                    Transform: {
                         TransformType: OneSparkJs.Renderer2DTransform.TransformType,
                         AnchorType: OneSparkJs.Renderer2DTransform.AnchorTypeEnum,
                         AnchorTransform: OneSparkJs.Renderer2DTransform.AnchorTransformType
                    }
               }
          },
          Canvas: {
               setState: OneSparkJs.Canvas.setState,
               getState: OneSparkJs.Canvas.getState,
               getContext: OneSparkJs.Canvas.getContext,
               getThreeRenderer: OneSparkJs.Canvas.getThreeRenderer,
               getSize: OneSparkJs.Canvas.getSize,
               getStyle: OneSparkJs.Canvas.getStyle,
               publish: OneSparkJs.Canvas.publish,
               setFullScreen: OneSparkJs.Canvas.setFullScreen
          },
          register: OneSparkJs.Renderer.Ext.register,
          render: OneSparkJs.Renderer.Ext.render,
          destroy: OneSparkJs.Renderer.Ext.destroy,
          getStage: OneSparkJs.Renderer.Ext.getStage,
          getActiveName: OneSparkJs.Renderer.Ext.getActiveName,
          switchTo: OneSparkJs.Renderer.Ext.switchTo
     };

})(typeof window !== 'undefined' ? window : global);

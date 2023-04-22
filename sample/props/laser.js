﻿class Laser extends $1S.Physics.Types.PhysicsBoundType {

     onInit(properties) {
          this.width = 20;
          this.height = 20;
          this.workCanvas.width = this.width;
          this.workCanvas.height = this.height;
          this.workContext = this.workCanvas.getContext('2d')
          this.collisionBorder = $1S.Physics.Collisions.createHexagon(this.width, this.height);
          this.updateDrawing = true;
     }

     destroy() {
          const stage = $1S.Renderer.get().Instance;
          stage.destroyProp(this.id);
     }

     onUpdate(timeStamp, deltaTime) {
          if (this.isOffScreen()) {
               this.destroy();
          }
     }

     onDraw(context) {

          if (this.updateDrawing) {
               context.translate(0, 0);
               context.beginPath();
               context.moveTo(0, this.height / 2);
               context.lineTo(this.width, this.height / 2);
               context.closePath();
               context.strokeStyle = '#ffffff';
               context.lineWidth = 2;
               context.stroke();
               this.updateDrawing = false;
          }

     }

}

$1S.registerType(await Laser, "Laser");



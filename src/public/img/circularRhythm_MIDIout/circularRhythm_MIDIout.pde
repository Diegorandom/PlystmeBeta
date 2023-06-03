import themidibus.*;

MidiBus myBus; 

//float x, y;
//float cx, cy, rd, freq;
//float angVel;
//float nDiv, ang;  
//int nPice = 0;
//int pPice = 0;
//int[] notes = {63, 69, 67, 60, 62, 72, 69, 63};

//---------------
void setup() {
  size(600, 600);
  background(0);

  MidiBus.list();
  myBus = new MidiBus(this, "Bus 1", "Bus 1");
  
  cmidi = new circularMIDI;
  
  cmidi = new circularMIDI;


    //cx = width/2.0;
    //cy = height/2.0;
    //rd = 250;
    //freq = 9/16.0;
    //nDiv = 9.0;
    //ang = 360/nDiv;
    //colorMode(HSB, 360, 255, 255, 255);
}

//---------------
void draw() {
  //background(0);
  noStroke();
  fill(180, 255, 20, 3);
  rect(0,0, width, height);

  //angVel = TWO_PI* millis()* freq/1000.0;

  //for (int i = 0; i < nDiv; i++) {
  //  if (degrees(angVel) % 360 > ang*i && degrees(angVel)%360 < ang*(i+1) ) {
  //    fill(360.0/(i+1), 255, 255, 127);
  //    nPice = i;

  //    if (pPice != nPice) {
  //      myBus.sendNoteOn(0, notes[i % notes.length], 127);
  //      pPice = nPice;
  //    }
  //  }
  //}

  //x = cx + rd*cos(angVel);
  //y = cy + rd*sin(angVel);

  ////noFill();
  //stroke(x , y, 255, 127);
  //ellipse(x, y, 20, 20); 
  //line(cx, cy, x, y);
  //stroke(255);

  //for (int i = 0; i < nDiv; i++) {
  //  pushMatrix();

  //  translate(width/2.0, height/2.0);
  //  rotate(radians(ang)*i);
  //  line(0, 0, width/2.0, 0);

  //  popMatrix();
  }

  //rd += 0.5; // uncommet this to generate a spiral
}

//---------------------------------------------
void keyPressed() {
  if (key == 'p') {
    myBus.sendNoteOn(0, 60, 127);
  }

  if (key == 'w') {
    myBus.sendNoteOn(0, 67, 127);
  }
}
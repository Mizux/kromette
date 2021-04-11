function setup() {
  width = 1024;
  height = 512;
  createCanvas(width, height);
  frameRate(60);
  
  cell_x = 32;
  cell_y = 32;
  
  chat_nb = 31
  img = loadImage('assets/chat.png');
  chat_factor = 0.1;
  chat_pos = [];
  for(i=0; i< chat_nb; ++i) {
    chat_pos.push([random()*width, random()*height]);
  }
  
  t = 0;
}

function draw_cats() {
  move_factor = 1;
  for (i=0; i < chat_nb; ++i) {
    a = random()*2 - 1;
    b = random()*2 - 1;
    
    chat_pos[i][0] = constrain(chat_pos[i][0] + a*move_factor,0, width);
    chat_pos[i][1] = constrain(chat_pos[i][1] + b*move_factor,0, height);
    
    image(img,
      chat_pos[i][0],
      chat_pos[i][1],
      img.width*chat_factor,
      img.height*chat_factor);
  }
}

function draw() {
  move_factor = 0.1;
  t++;
  background(10,10,10);
  
  // draw grid
  for(x=0; x < cell_x; ++x) {
      for(y=0; y < cell_y; ++y) {
        a = pow((x - cell_x/2),2) + pow((y - cell_y/2),2);
        b = sqrt(a);       
        c = color(
          255*0.1,
          255 * (cos(b-t*move_factor)/3 + 0.5),
          255 * (cos(b-t*move_factor)/4 + 0.5)
        );
        fill(c);
        rect(
          width/cell_x * x,
          height/cell_y * y,
          width/cell_x,
          height/cell_y); // Draw rectangle
      } 
  } 

  draw_cats();
}
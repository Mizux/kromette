// Simple minesweeper
// todo(mizux): use fast inverse squared root when computing cell color ?
// ref: https://en.wikipedia.org/wiki/Fast_inverse_square_root

// todo(mizux) Use vector normalization for cat speed
// todo(mizux) Use poisson disc distribution for cat initial positions ?

let debug = false;
let screen = [800, 600]; // size of the scene [width,height]
let cell_columns = 16;
let cell_rows = 25;
let krokette_ratio = 0.1; // 10% of all cells

function setup() {
  createCanvas(screen[0], screen[1]);
  frameRate(60);
  t = 0; // tick (used for animation)

  // Init grid
  {
    cell_width = screen[0] / cell_columns;
    cell_height = screen[1] / cell_rows;
    cell_number = cell_columns * cell_rows;
    krokette_number = int(cell_number * krokette_ratio);
    if (debug) {
      console.log("cell dim: " + cell_width + "x" + cell_height + " px");
      console.log("cell number: " + cell_number);
      console.log("krokette number: " + krokette_number);
    }
    cell_discover = [];
    for (i = 0; i < cell_number; ++i) {
      cell_discover.push(false);
    }
  }

  // Init Krokettes
  {
    cell_values = [];
    for (i = 0; i < cell_number; ++i) {
      cell_values.push(0);
    }
    krokette_img = loadImage('assets/krokette.png');
    krokette_factor = 0.05;

    hide_krokettes();
  }

  // Init Cats
  {
    cat_snd = [];
    // Cat, Screaming, A.wav" by InspectorJ (www.jshaw.co.uk) of Freesound.org
    cat_snd.push(loadSound('assets/cat_0.wav'));
    cat_snd.push(loadSound('assets/cat_1.wav'));
    cat_snd.push(loadSound('assets/cat_2.wav'));

    cat_img = [];
    cat_img.push(loadImage('assets/cat_0.png'));
    cat_img.push(loadImage('assets/cat_1.png'));
    cat_factor = 0.075;
    cat_pos = []; // Cats position
    cat_speed = []; // Cats speed
  }

  // mouse
  mouse = [screen[0] / 2, screen[1] / 2];
}

function add_cat(x, y) {
  cat_pos.push([
    x * cell_width, // x
    y * cell_height // y
  ]);

  cat_speed.push([
    random() * 2 - 1,
    random() * 2 - 1
  ]);
}


function hide_krokettes() {
  krokette_found = 0;
  for (i = 0; i < krokette_number; ++i) {
    cell_values[i] = "krokette";
  }
  // shuffle krokettes
  for (i = 0; i < krokette_number; ++i) {
    let new_pos = floor(random() * (cell_number + 1));
    let tmp = cell_values[new_pos];
    cell_values[new_pos] = cell_values[i];
    cell_values[i] = tmp;
  }
  // Compute cells values
  for (x = 0; x < cell_columns; ++x) {
    for (y = 0; y < cell_rows; ++y) {
      if (cell_values[index(x, y)] !== "krokette") {
        cell_values[index(x, y)] = get_neighbhors_krokettes(x, y);
      }
    }
  }
}

function reset() {
  t = 0;
  for (i = 0; i < cell_number; ++i) {
    cell_discover[i] = false;
    cell_values[i] = 0;
  }
  hide_krokettes();

  // Reset cats pos and speed
  cat_pos.length = 0;
  cat_speed.length = 0;
}

function index(x, y) {
  return y * cell_columns + x;
}

function is_valid(x, y) {
  if (x < 0 || x >= cell_columns || y < 0 || y >= cell_rows) {
    return false;
  }
  return true;
}

function get_neighbhors_krokettes(x, y) {
  let krokettes = 0;
  // row above
  krokettes += is_krokettes(x - 1, y - 1) ? 1 : 0;
  krokettes += is_krokettes(x, y - 1) ? 1 : 0;
  krokettes += is_krokettes(x + 1, y - 1) ? 1 : 0;

  // cell left/right
  krokettes += is_krokettes(x - 1, y) ? 1 : 0;
  krokettes += is_krokettes(x + 1, y) ? 1 : 0;

  // row below
  krokettes += is_krokettes(x - 1, y + 1) ? 1 : 0;
  krokettes += is_krokettes(x, y + 1) ? 1 : 0;
  krokettes += is_krokettes(x + 1, y + 1) ? 1 : 0;
  return krokettes;
}

function is_krokettes(x, y) {
  if (!is_valid(x, y)) {
    return false;
  }
  return cell_values[index(x, y)] === "krokette";
}

function draw_cats() {
  let move_factor = 3;
  for (i = 0; i < cat_pos.length; ++i) {
    let new_pos = [
      cat_pos[i][0] + move_factor * cat_speed[i][0],
      cat_pos[i][1] + move_factor * cat_speed[i][1]
    ];

    // inverse speed if reaching border
    let index = i % cat_img.length
    if ((new_pos[0] > screen[0] - cat_img[index].width * cat_factor) || (new_pos[0] < 0)) {
      cat_speed[i][0] = -cat_speed[i][0];
    }
    if ((new_pos[1] > screen[1] - cat_img[index].height * cat_factor) || (new_pos[1] < 0)) {
      cat_speed[i][1] = -cat_speed[i][1];
    }

    cat_pos[i][0] = constrain(new_pos[0], 0, screen[0] - cat_img[index].width * cat_factor);
    cat_pos[i][1] = constrain(new_pos[1], 0, screen[1] - cat_img[index].height * cat_factor);

    image(cat_img[index],
      cat_pos[i][0],
      cat_pos[i][1],
      cat_img[index].width * cat_factor,
      cat_img[index].height * cat_factor);
  }
}

function draw_grid() {
  let move_factor = 0.05;
  textAlign(CENTER, CENTER);
  // use to center krokette img
  let delta_x = (cell_width - (krokette_img.width * krokette_factor)) / 2;
  let delta_y = (cell_height - (krokette_img.height * krokette_factor)) / 2;

  for (y = 0; y < cell_rows; ++y) {
    for (x = 0; x < cell_columns; ++x) {
      let a = pow((x - cell_columns / 2), 2) + pow((y - cell_rows / 2), 2);
      let b = sqrt(a);
      let c = color(
        255 * 0.1,
        255 * (cos(b - t * move_factor) / 3 + 0.5),
        255 * (cos(b - t * move_factor) / 4 + 0.5)
      );
      fill(c);
      rect(
        cell_width * x, // Px
        cell_height * y, // Py
        cell_width, // width
        cell_height, // height
        min(cell_width, cell_height) / 3 // radius corner
      );

      // Draw cells
      if (cell_discover[index(x, y)]) {
        if (cell_values[index(x, y)] === "krokette") {
          image(krokette_img,
            x * cell_width + delta_x,
            y * cell_height + delta_y,
            krokette_img.width * krokette_factor,
            krokette_img.height * krokette_factor);
        } else {
          let c = color(10, 10, 10)
          fill(c);
          rect(
            x * cell_width + 2,
            y * cell_height + 2,
            cell_width - 4, cell_height - 4);
          fill(color(255, 255, 255));
          text(cell_values[index(x, y)],
            cell_width * x + cell_width / 2, // Px
            cell_height * y + cell_height / 2 // Py
          );
        }
      }
    }
  }
}

// debug: Display cell coordinate and kroketted (text in red)
function draw_debug() {
  textAlign(CENTER, CENTER);

  for (y = 0; y < cell_rows; ++y) {
    for (x = 0; x < cell_columns; ++x) {
      if (cell_values[index(x, y)] === "krokette") {
        fill(color(255, 0, 0, 128));
        text(x + ":" + y,
          cell_width * x + cell_width / 3, // Px
          cell_height * y + cell_height / 3 // Py
        );
      } else {
        fill(color(0, 255, 0, 128));
        text(x + ":" + y,
          cell_width * x + cell_width / 3, // Px
          cell_height * y + cell_height / 3 // Py
        );
      }
    }
  }
}

// debug: Display cell clicked
function draw_mouse() {
  let mouse_width = screen[0] / cell_columns / 2;
  let mouse_height = screen[1] / cell_rows / 2;

  fill(color(255, 255, 255, 64));
  ellipse(
    mouse[0] * cell_width + cell_width / 2,
    mouse[1] * cell_height + cell_height / 2,
    mouse_width,
    mouse_height);
}

function draw() {
  background(10, 10, 10); // clear board
  t++; // tick

  draw_grid();

  draw_cats();

  if (debug) {
    draw_debug();
    draw_mouse();
  }
}

function mouseClicked() {
  let Px = int(mouseX / cell_width);
  let Py = int(mouseY / cell_height);
  mouse = [Px, Py];

  play(Px, Py);
  // prevent default
  return false;
}

function play(x, y) {
  if (!is_valid(x, y)) {
    console.log("invalid move !");
    return false;
  }

  if (cell_discover[index(x, y)]) {
    console.log("cell already played !");
    return false;
  }

  // Just clicked on a krokette !
  if (cell_values[index(x, y)] === "krokette") {
    cell_discover[index(x, y)] = true;
    cat_snd[cat_pos.length % cat_snd.length].play();
    add_cat(x, y);
    krokette_found++;

    if (krokette_found == krokette_number) {
      console.log("Game Over !");
      reset();
    }
    return true;
  }

  let pile = [];
  pile.push([x, y]);
  while (pile.length !== 0) {
    let p = pile.shift();
    if (debug) {
      console.log("Playing: " + p);
    }
    p_index = index(p[0], p[1]);
    // if krokette or invalid or already discover simply drop it
    if (!is_valid(p[0], p[1]) ||
      cell_values[p_index] === "krokette" ||
      cell_discover[p_index]) {
      continue
    }

    cell_discover[p_index] = true;
    // if 0 add neighbours
    if (cell_values[p_index] === 0) {
      if (debug) {
        console.log("Found 0 !");
      }
      // Cells in row above
      pile.push([p[0] - 1, p[1] - 1]);
      pile.push([p[0], p[1] - 1]);
      pile.push([p[0] + 1, p[1] - 1]);
      // Cells Left/Right
      pile.push([p[0] - 1, p[1]]);
      pile.push([p[0] + 1, p[1]]);
      // Cells in row below
      pile.push([p[0] - 1, p[1] + 1]);
      pile.push([p[0], p[1] + 1]);
      pile.push([p[0] + 1, p[1] + 1]);
    }
  }
  return true;
}

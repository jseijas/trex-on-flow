class Rectangle {
  constructor(x, y, width, height) {
    if (!y) {
      this.x = x.x;
      this.y = x.y;
      this.width = x.width;
      this.height = x.height;
    } else {
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
    }
  }

  static group(...dimensions) {
    const result = [];
    dimensions.forEach((dimension) => {
      result.push(new Rectangle(dimension[0], dimension[1], dimension[2], dimension[3]));
    });
    return result;
  }

  static collision(a, b) {
    return (a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.height
      + a.y > b.y);
  }
}

module.exports = Rectangle;
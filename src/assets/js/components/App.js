"use strict";
// import Header from "./Header";
// import FocusTrapModal from "./FocusTrapModal";
// import GenericAccordion from "./GenericAccordion";
import SidebarFixControl from "./SidebarFixControl";

class App {
  constructor() {
  }

  render() {
    let winW = innerWidth;
    // new Header()
    // new GenericAccordion({ debug: true })
    
    if (winW > 1023) {
      new SidebarFixControl({ debug: true })
      // new FocusTrapModal()
     }
  }
}

export default App;

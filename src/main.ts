import AppController from "./Controllers/AppController";
import AppModel from "./Models/AppModel";
import AppView from "./Views/AppView";
import "./styles.css";

const model = new AppModel();
const view = new AppView();
const controller = new AppController(model, view);
controller.run();

import "./App.css";
import Camera from "./components/Camera";
import Temperature from "./components/Temperature";
import Command from "./components/Command";

function App() {
  return (
    <div className="App robot-container">
      <h1>Contrôle du Robot</h1>
      <Camera />
      <Temperature />
      <Command />
    </div>
  );
}

export default App;

import "./App.css";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";
import { v4 as uuidV4 } from "uuid";

//components
import TextEditor from "./components/TextEditor";

function App() {
  return (
    <Router>
      <Switch>
        <Route path={"/documents/:documentId"} exact>
          <TextEditor />
        </Route>
        <Redirect to={`/documents/${uuidV4()}`} />
      </Switch>
    </Router>
  );
}

export default App;

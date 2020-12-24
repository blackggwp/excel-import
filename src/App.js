import './App.css';
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from 'react-router-dom'
import UploadPanel from './components/UploadPanel'
// import RenderPdf from './components/RenderPdf';
import SearchPanel from './components/SearchPanel';

function App() {

  return (
    <Router>
      <Switch>
        <Route exact path="/" component={UploadPanel} />
        <Route exact path="/pdf" component={SearchPanel} />
      </Switch>
    </Router>
  )
}

export default App


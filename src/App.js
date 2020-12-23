import './App.css';
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from 'react-router-dom'
import UploadFile from './components/UploadFile'
// import RenderPdf from './components/RenderPdf';
import SearchPanel from './components/SearchPanel';

function App() {

  return (
    <Router>
      <Switch>
        <Route exact path="/" component={UploadFile} />
        <Route exact path="/pdf" component={SearchPanel} />
      </Switch>
    </Router>
  )
}

export default App


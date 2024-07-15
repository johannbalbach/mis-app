import React from 'react';
import 'antd/dist/reset.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/navbar/Navbar';
import LoginForm from './components/profile/Login';
import RegisterForm from './components/profile/Register';
import MainContent from './components/Main';
import { Provider } from 'react-redux';
import store from './store/store';
import ProfileForm from './components/profile/profile';
import PatientsList from './components/patients/PatientsList';
import PatientCard from './components/patients/PatientCard';
import fontawesome from '@fortawesome/fontawesome'
import { faVenus, faMars, faPenToSquare, faMagnifyingGlass,  faChevronDown, faChevronRight, faUserPlus, faPlus} from '@fortawesome/free-solid-svg-icons'
import CreateInspection from './components/inspections/createInspection';
import InspectionDetails from './components/inspections/inspectionDetails';
import ReportsPage from './components/reports/ReportsPage';
import ConsultationPage from './components/consultation/consultationPage';

fontawesome.library.add(faVenus, faMars, faPenToSquare, faMagnifyingGlass,  faChevronDown, faChevronRight, faUserPlus, faPlus);

function App() {
  return (
    <Provider store={store}>
      <Router>
      <div className="App">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<MainContent />} />
            <Route path="/login" element={<LoginForm />} />
            <Route path="/register" element={<RegisterForm />} />
            <Route path="/profile" element={<ProfileForm/>}/>
            <Route path="/patients" element={<PatientsList/>}/>
            <Route path="/patient/:id" element={<PatientCard/>}/>
            <Route path="/inspection/create" element={<CreateInspection/>}/>
            <Route path="/inspection/:id" element={<InspectionDetails/>}/>
            <Route path="/reports" element={<ReportsPage/>}/>
            <Route path="/consultations" element={<ConsultationPage/>}/>
          </Routes>
        </main>
      </div>
      </Router>
    </Provider>

  );
}

export default App;

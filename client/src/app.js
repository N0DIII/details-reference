const { useEffect, useState } = require('react');
const { BrowserRouter, Route, Routes } = require('react-router-dom');

const url = require('./server_url.js');

require('./styles/index.css');

const Main = require('./components/main').default;
const Detail = require('./components/detail').default;

export default function App() {
    const [userData, setUserData] = useState(false);

    useEffect(() => {
        auth().then(result => {
            setUserData(result);
        })
    }, [])

    async function auth() {
        return fetch(url + '/auth', { method: 'post', headers: { 'Content-Type': 'application/json; charset=utf-8', 'authorization': localStorage.getItem('token') } })
        .then(response => response.json())
    }

    return(
        <BrowserRouter>
            <div className='App'>
                <Routes>
                    <Route path='/' element={<Main userData={userData}/>}/>
                    <Route path='/detail/:id' element={<Detail/>}/>
                </Routes>
            </div>
        </BrowserRouter>
    )
}
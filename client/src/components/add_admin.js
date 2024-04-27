const { useState } = require('react');
const { server } = require('../server');

export default function AddAdmin(props) {
    const { close } = props;

    const [login, setLogin] = useState('');
    const [error, setError] = useState('');

    function addAdmin() {
        server('/addAdmin', { login })
        .then(result => {
            if(result.error) setError(result.error);
            else {
                close();
                alert('Права выданы успешно');
            }
        })
    }

    return(
        <div className='login_wrapper'>
            <div className='login_form'>
                <div className='login_close' onClick={close}>×</div>
                <div className='login_title'>Добавление администратора</div>

                <div className='login_label'>Логин:</div>
                <div className='login_input'>
                    <input type='text' value={login} onChange={e => setLogin(e.target.value)}/>
                </div>

                <div className='login_error'>{error}</div>
                <button className='login_button' onClick={addAdmin}>Дать права администратора</button>
            </div>
        </div>
    )
}
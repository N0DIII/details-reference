const { useState, useRef } = require('react');
const { server } = require('../server');

require('../styles/login.css');

export default function Registration(props) {
    const { setShow } = props;

    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [repeatPassword, setRepeatPassword] = useState('');

    const [isShow, setIsShow] = useState([false, false]);
    const [error, setError] = useState('');
    const input1 = useRef(null);
    const input2 = useRef(null);

    function showPassword1(e) {
        if(isShow[0]) {
            input1.current.type = 'password';
            e.target.src = 'src/eye.png';
            setIsShow([false, isShow[1]]);
        }
        else {
            input1.current.type = 'text';
            e.target.src = 'src/crossEye.png';
            setIsShow([true, isShow[1]]);
        }
    }

    function showPassword2(e) {
        if(isShow[1]) {
            input2.current.type = 'password';
            e.target.src = 'src/eye.png';
            setIsShow([isShow[0], false]);
        }
        else {
            input2.current.type = 'text';
            e.target.src = 'src/crossEye.png';
            setIsShow([isShow[0], true]);
        }
    }

    function login() {
        server('/registration', { name, password, repeatPassword })
        .then(result => {
            if(!result.token) setError(result);
            else window.location.reload();
        })
    }

    return(
        <div className='login_wrapper'>
            <div className='login_form'>
                <div className='login_close' onClick={() => setShow(false)}>×</div>

                <div className='login_title'>Регистрация</div>
                <div className='login_label'>Имя:</div>
                <div className='login_input'>
                    <input type='text' value={name} onChange={e => setName(e.target.value)}/>
                </div>
                <div className='login_label'>Пароль:</div>
                <div className='login_input'>
                    <input type='password' ref={input1} value={password} onChange={e => setPassword(e.target.value)}/>
                    <img src='src/eye.png' onClick={showPassword1}/>
                </div>
                <div className='login_label'>Повторите пароль:</div>
                <div className='login_input'>
                    <input type='password' ref={input2} value={repeatPassword} onChange={e => setRepeatPassword(e.target.value)}/>
                    <img src='src/eye.png' onClick={showPassword2}/>
                </div>
                <div className='login_error'>{error}</div>
                <button className='login_button' onClick={login}>Зарегистрировать</button>
            </div>
        </div>
    )
}
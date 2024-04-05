const { useState, useEffect } = require('react');
const { useParams, useNavigate } = require('react-router-dom');
const { server } = require('../server');

require('../styles/detail.css');

export default function Detail() {
    const params = useParams();
    const { id } = params;

    const navigate = useNavigate();

    const [detail, setDetail] = useState(false);

    useEffect(() => {
        server('/getDetail', { id }).then(result => setDetail(result));
    }, [])

    function getDate(time) {
        const date = new Date(time);

        const day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
        const month = date.getMonth() + 1 < 10 ? '0' + Number(date.getMonth() + 1) : date.getMonth() + 1;
        const year = date.getFullYear();
        return `${day}.${month}.${year}`;
    }

    if(detail == null) {
        return(
            <div className='detail_wrapper'>
                <div className='detail_nopage'>
                    Страница не найдена
                    <button className='detail_button nopage_button' onClick={() => navigate('/')}>На главную</button>
                </div>
            </div>
        )
    }
    else if(!detail) {
        return(
            <div className='detail_wrapper'>
                <div className='detail_nopage'>Загрузка...</div>
            </div>
        )
    }
    else {
        return(
            <div className='detail_wrapper'>
                <button className='detail_back detail_button' onClick={() => navigate('/')}>{'<'} Назад</button>

                <div className='detail_data'>
                    <div className='detail_created'>{getDate(detail.description.time)}</div>
                    <div className='detail_view'>
                        {detail.view}
                        <img src='../src/view.png'/>
                    </div>
                </div>

                <div className='detail_title'>{detail.title}</div>
                <div className='detail_description'>
                    {detail.description.blocks.map((block, i) =>
                        <div key={i} className='detail_description_block'>
                            {block.type == 'paragraph' && <div>{block.data.text}</div>}
                            {block.type == 'image' && <img src={block.data.file.url}/>}
                        </div>
                    )}
                </div>
            </div>
        )
    }
}
const { useState, useEffect } = require('react');
const { useNavigate } = require('react-router-dom');
const { server } = require('../server');

require('../styles/busket.css');

export default function Busket(props) {
    const { userData } = props;
    const navigate = useNavigate();

    const [products, setProducts] = useState(null);
    const [stop, setStop] = useState(false);

    useEffect(() => {
        if(!userData.auth) return;

        server('/getProducts', { user: userData._id }).then(result => setProducts(result));
    }, [userData])

    function plusBusket(item) {
        if(item.allCount <= 0 || stop) return;
        setStop(true);

        server('/addProduct', { product: item._id, user: userData._id, count: item.count + 1, stat: -1 })
        .then(result => {
            setProducts(prevState => prevState.map(prod => {
                if(prod._id == item._id) return { ...prod, count: prod.count + 1 };
                else return prod;
            }))
            setStop(false);
        })
    }

    function minusBusket(item) {
        if(stop) return;
        setStop(true);

        if(item.count - 1 == 0) deleteBusket(item);
        else {
            server('/addProduct', { product: item._id, user: userData._id, count: item.count - 1, stat: 1 })
            .then(result => {
                setProducts(prevState => prevState.map(prod => {
                    if(prod._id == item._id) return { ...prod, count: prod.count - 1 };
                    else return prod;
                }))
                setStop(false);
            })
        }
    }

    function deleteBusket(item) {
        server('/deleteProduct', { product: item._id, user: userData._id })
        .then(result => {
            setProducts(prevState => prevState.filter(prod => prod._id != item._id));
            setStop(false);
        })
    }

    function addOrder() {
        let prod = products;
        for(let i = 0; i < prod.length; i++) {
            prod[i] = { _id: prod[i]._id, count: prod[i].count };
        }
        server('/addOrder', { user: userData._id, products: prod })
        .then(result => server('/getProducts', { user: userData._id }).then(result => setProducts(result)))
    }

    if(!userData.auth) {
        return(
            <div className='busket_noAuth_wrapper'>
                <button className='detail_back detail_button' onClick={() => navigate('/')}>На главную</button>
                <div className='busket_noAuth'>Сначала войдите в аккаунт</div>
            </div>
        )
    }
    else if(products == null) {
        return(
            <div className='busket_noAuth_wrapper'>
                <div className='busket_noAuth'>Загрузка...</div>
            </div>
        )
    }
    else if(products.length == 0) {
        return(
            <div className='busket_noAuth_wrapper'>
                <button className='detail_back detail_button' onClick={() => navigate('/')}>На главную</button>
                <div className='busket_noAuth'>Нет товаров</div>
            </div>
        )
    }
    else {
        return(
            <div className='busket_wrapper'>
                <button className='detail_back detail_button' onClick={() => navigate('/')}>На главную</button>
                {products.map((item, i) =>
                    <div key={i} className='busket_product_wrapper'>
                        {item.cover != '' && <img className='busket_product_cover' src={item.cover}/>}
                        {item.cover == '' && <div className='busket_product_cover'>Нет изображения</div>}
                        <div className='busket_product_title'>{item.title}</div>
                        <div className='busket_product_count'>
                            <div onClick={() => minusBusket(item)}>-</div>
                            {item.count}
                            <div onClick={() => plusBusket(item)}>+</div>
                        </div>
                    </div>
                )}

                <button className='detail_button' onClick={addOrder}>Заказать</button>
            </div>
        )
    }
}
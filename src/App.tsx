import { useState, useMemo, useEffect } from 'react';
import coffeeData from './coffeeData';

type Coffee = {
  id: number;
  name: string;
  price: number;
  url: string;
};

function App() {
  
  const [nextFreeId, setNextFreeId] = useState(0);
  const [selectedCoffee, setSelectedCoffee] = useState(0);
  const [coffeesList, setCoffeesList] = useState<Coffee[]>([]);
  const [shoppingCart, setShoppingCart] = useState<Coffee[]>([]);

  const shoppingPrice = useMemo(() =>
    shoppingCart.map(item => item.price).reduce((a, b) => a + b, 0).toFixed(2), [shoppingCart]);


  useEffect(() => {
    (async () => {
      await new Promise<void>(resolve => {
          setTimeout(() => {
            setCoffeesList(coffeeData);
            getDataFromLocalStorage();
            resolve();
          }, 100);
      });
    })();
  }, []);

  const getDataFromLocalStorage = () => {
    if (shoppingCart.length === 0) {
      const storedCart = localStorage.getItem("coffeeBillboard_shoppingCart");
      if (storedCart && storedCart.length > 2) {
        setShoppingCart(JSON.parse(storedCart) as Coffee[]);
        setNextFreeId(Number(localStorage.getItem("coffeeBillboard_nextFreeId")) || 0);
        setSelectedCoffee(Number(localStorage.getItem("coffeeBillboard_selectedCoffee")) || 0);
      }
    }
  };

  const storeShoppingCartToLocalStorage = (shoppingCart: Coffee[]) => {
    localStorage.setItem("coffeeBillboard_shoppingCart", JSON.stringify(shoppingCart));
  };

  const incrementNextFreeId = () => {
    setNextFreeId(prev => {
      const newId = prev + 1;
      localStorage.setItem("coffeeBillboard_nextFreeId", String(newId));
      return newId;
    });
  };

  const selectCoffee = (event: React.ChangeEvent<HTMLSelectElement>) => {
    event.preventDefault();
    let id = event.target.value;
    setSelectedCoffee(() => {
      localStorage.setItem("coffeeBillboard_selectedCoffee", id);
      return Number(id);
    });
  }

  const addCoffee = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setShoppingCart(prev => {
      const coffeeFromMenu = coffeesList.find((item) => item.id === selectedCoffee);

      if (!coffeeFromMenu) {
        console.error("Selected coffee not found!");
        return prev;
      }

      const { name, price, url } = coffeeFromMenu;

      const coffeeToAdd: Coffee = {
        id: nextFreeId,
        name: name,
        price: price,
        url: url
      }

      const updatedList = [...prev, coffeeToAdd];
      storeShoppingCartToLocalStorage(updatedList);
      incrementNextFreeId();

      return updatedList;
    })
  };

  const removeCoffee = (id: number) => {
    setShoppingCart(prev => {
      const shortenedList = prev.filter((item) => item.id !== id);
      storeShoppingCartToLocalStorage(shortenedList);
      return shortenedList;
    });
  };

  const payForCoffee = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setShoppingCart(() => {
      storeShoppingCartToLocalStorage([]);
      return [];
    });
    setNextFreeId(() => {
      localStorage.setItem("coffeeBillboard_nextFreeId", "0");
      return 0;
    });
  };

  function OptionsList ({ coffeesList }: { coffeesList: Coffee[] }) {
    return (
      <>
        {
          coffeesList.map((item) => 
            (<option id={`option_${item.id}`} key={`option_${item.id}`} value={item.id}>{item.name} - {item.price}€</option>)
          )
        }
      </>
    );
  };

  function CoffeeCards ({shoppingCart, removeCoffee}: {shoppingCart: Coffee[], removeCoffee: (id: number) => void}) {
    return (
      <>
        {
          shoppingCart.map((item) =>
          (
            <div key={item.id} className="coffee_container">
              <img src={item.url} alt={item.name}/>
              <h3>{item.price}€</h3>
              <p>{item.name}</p>
              <button 
                name={String(item.id)}
                className="remove"
                onClick={() => removeCoffee(item.id)}
              >
              remove
              </button>
            </div>
          ))
        }
      </>
    );
  };

  return (
    <>
        <header>
          <h1>Coffee Billboard</h1>
          <h2>Price: {shoppingPrice}€</h2>
          <form>
            <select name="coffee_select" value={selectedCoffee} onChange={selectCoffee}>
                <OptionsList coffeesList={coffeesList}/>  
            </select>
            <button className="add_button"onClick={addCoffee}>Add</button>
            <button className="pay_button" onClick={payForCoffee}>Pay</button>
          </form>
        </header>
        <div className="content_container">
          <CoffeeCards shoppingCart={shoppingCart} removeCoffee={removeCoffee}/>
        </div>
    </>
  )
}

export default App;

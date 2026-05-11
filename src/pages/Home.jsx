function Home() {
    const user = JSON.parse(localStorage.getItem("user"));
  
    return (
      <div>
        
        <h1>Home Page</h1>
  
        <h2>Welcome {user.firstName}</h2>
      </div>
    );
  }
  
  export default Home;
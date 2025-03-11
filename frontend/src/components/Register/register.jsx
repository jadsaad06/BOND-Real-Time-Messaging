import './register.css';

function Register() {
  return (
    <div className="login-container">
      <h1 className="login-title">Bond</h1>
      <div className="login-form">
        <input
          type="text"
          placeholder="Username"
          className="login-input"
        />
        <input
          type="password"
          placeholder="Password"
          className="login-input"
        />
        <button className="login-button">
          Register
        </button>
      </div>
    </div>
  );
}

export default Register;
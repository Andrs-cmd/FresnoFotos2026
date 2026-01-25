export default function Button({ children, type = "submit", ...props }) {
  return (
    <button type={type} {...props}>
      {children}
    </button>
  );
}

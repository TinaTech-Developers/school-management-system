interface ToastProps {
  message: string;
  type: "success" | "error";
}

export function showToast({ message, type }: ToastProps) {
  const toast = document.createElement("div");
  toast.className = `fixed bottom-6 right-6 px-4 py-2 rounded shadow text-white ${
    type === "success" ? "bg-green-500" : "bg-red-500"
  }`;
  toast.innerText = message;

  const closeButton = document.createElement("button");
  closeButton.innerText = "X";
  closeButton.className = "font-bold ml-4";
  closeButton.onclick = () => document.body.removeChild(toast);

  toast.appendChild(closeButton);
  document.body.appendChild(toast);

  setTimeout(() => {
    if (document.body.contains(toast)) {
      document.body.removeChild(toast);
    }
  }, 3000);
}

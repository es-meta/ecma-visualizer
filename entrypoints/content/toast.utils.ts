export const showToast = (message: string) => {
  const toast = document.createElement("div");
  toast.classList.add("vis--toast");
  toast.style.transform = "scale(0.5)";
  toast.style.opacity = "0";
  toast.style.transition =
    "transform 0.3s ease-in-out, opacity 0.3s ease-in-out";
  toast.innerText = message;

  const progress = document.createElement("div");
  progress.classList.add("vis--toast-progress");
  progress.style.transition = "width 10s linear";
  toast.appendChild(progress);

  document.body.appendChild(toast);

  // why requestAnimationFrame not work properly sometimes?
  setTimeout(() => {
    toast.style.transform = "scale(1)";
    toast.style.opacity = "1";
    progress.style.width = "0%";
  }, 0);

  // 사라질 타이밍에 애니메이션 후 제거
  setTimeout(() => {
    toast.style.transform = "scale(0.5)";
    toast.style.opacity = "0";

    // 애니메이션이 끝난 후 DOM에서 제거 (300ms 딜레이)
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 10000);
};

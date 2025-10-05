import { useRef, useState, useEffect } from "react";
import { Button, Card } from "antd";

interface Student {
  name: string;
  institute: string;
  type: string;
  from_time: number;
  to_time: number;
  date: string;
  remote_url: string;
}

interface Props {
  student: Student;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const s = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
}

export default function StudentItem({ student }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [currentTime, setCurrentTime] = useState(0);

  // Cập nhật thời gian hiện tại của video
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onTimeUpdate = () => setCurrentTime(video.currentTime);
    video.addEventListener("timeupdate", onTimeUpdate);
    return () => video.removeEventListener("timeupdate", onTimeUpdate);
  }, []);

  const handleCaptureFrame = async () => {
    const video = videoRef.current;
    if (!video) return alert("Không thể tìm thấy video.");

    if (video.readyState < 2) {
      alert("Vui lòng phát video ít nhất 1 lần trước khi chụp ảnh.");
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext("2d");
    if (!ctx) return alert("Không thể tạo context.");

    try {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    } catch (err) {
      console.error("Canvas error:", err);
      alert("Video bị chặn CORS, không thể chụp ảnh.");
      return;
    }

    try {
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob((b) => resolve(b), "image/jpeg", 0.95)
      );
      if (!blob) return alert("Không thể tạo blob ảnh.");

      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `Ảnh tốt nghiệp HUST 2025 của ${student.name}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);

      // 👉 Thêm dòng này:
      alert(`Ảnh của ${student.name} đã được tải xuống thành công!`);
    } catch (err) {
      console.error("Lỗi khi xử lý blob:", err);
      alert("Không thể tải ảnh xuống.");
    }
  };

  const handleDownloadVideo = async () => {
    try {
      const response = await fetch(student.remote_url, { mode: "cors" });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${student.name || "video"}.mp4`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      // 👉 Thêm dòng này:
      alert(`Video của ${student.name} đã được tải xuống thành công!`);
    } catch (err) {
      console.error("Error downloading video:", err);
      alert("Không thể tải video.");
    }
  };

  return (
    <Card
      key={student.name}
      style={{
        width: "100%",
        marginTop: 12,
        overflow: "hidden",
      }}
      bodyStyle={{ padding: 8 }}
    >
      {student.remote_url && (
        <>
          <div
            style={{
              width: "100%",
              overflow: "hidden",
              borderRadius: 8,
              background: "#000",
            }}
          >
            <video
              ref={videoRef}
              src={`${student.remote_url}#t=12`}
              controls
              crossOrigin="anonymous"
              style={{
                width: "100%",
                height: "auto",
                aspectRatio: "16 / 9",
                display: "block",
                borderRadius: 8,
                background: "#000",
              }}
            />
          </div>

          <div
            style={{
              display: "flex",
              gap: 8,
              marginTop: 8,
            }}
          >
            <Button
              type="default"
              onClick={handleCaptureFrame}
              style={{ flex: 1, fontSize: 14 }}
            >
              ⬇️ Ảnh tại {formatTime(currentTime)}
            </Button>

            <Button
              type="default"
              onClick={handleDownloadVideo}
              style={{ flex: 1, fontSize: 14 }}
            >
              ⬇️ Video
            </Button>
          </div>
        </>
      )}
    </Card>
  );
}

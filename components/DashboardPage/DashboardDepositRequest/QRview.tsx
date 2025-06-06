import Image from "next/image";

type QRCodeViewerProps = {
  qrImageSrc: string;
};

const QRCodeViewer = ({ qrImageSrc }: QRCodeViewerProps) => {
  return (
    <div className="">
      <div className="flex justify-center">
        <div className="relative overflow-hidden rounded-lg border-2 border-gray-200">
          <Image
            src={qrImageSrc}
            alt="QR Code"
            width={300}
            height={300}
            className="block"
            priority
          />
        </div>
      </div>
    </div>
  );
};

export default QRCodeViewer;

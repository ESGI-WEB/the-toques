import {useState} from 'react';
import {UploadOutlined} from "@mui/icons-material";
import Image from "next/image";

export default function Upload({
    onFileChange = (file: File) => null,
})
{
    const [selectedFile, setSelectedFile] = useState(null);

    const handleFileChange = (event: any) => {
        const file = event.target.files[0];
        setSelectedFile(file);
        onFileChange(file);
    };

    return (
        <div className="upload-container">
            <input
                id="imageInput"
                type="file"
                accept='image/png, image/jpeg, image/jpg'
                onChange={handleFileChange}
                className="image-upload-input"
            />
            {selectedFile ? (
                <Image className="image-upload-label" src={URL.createObjectURL(selectedFile)} alt="preview"/>
            ) : (
                <div className="upload-drag">
                    <p>Image de la recette</p>
                    <UploadOutlined/>
                </div>
            )}
        </div>
    );
}
;

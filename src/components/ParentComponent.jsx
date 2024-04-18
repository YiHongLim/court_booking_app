import { useState, useEffect } from 'react';
import CourtImageManager from './CourtImageManager';
import { ref, listAll, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';
import CourtCard from './courtCard';

const ParentComponent = ({ courtId }) => {
    const [images, setImages] = useState([]);
    const [firstImageUrl, setFirstImageUrl] = useState('');

    useEffect(() => {
        fetchImages();
    }, []);

    const fetchImages = async () => {
        const imagesRef = ref(storage, `courts/${courtId}`);
        const snapshot = await listAll(imagesRef);
        const urls = await Promise.all(snapshot.items.map(item => getDownloadURL(item)));
        setImages(urls);
        setFirstImageUrl(urls[0] || ''); // Store the first image URL
    };

    return (
        <div>
            <CourtImageManager courtId={courtId} fetchImages={fetchImages} />
            {firstImageUrl && <CourtCard court={{ id: courtId, image_url: firstImageUrl }} />}
        </div>
    );
};

export default ParentComponent;

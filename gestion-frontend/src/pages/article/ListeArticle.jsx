import React from 'react';
import { useEffect , useState } from 'react';
const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export default function ListeArticle() {

    const [articles, setArticles] = useState([]);
    const [error, setError] = useState(null);


    const fetchArticles = async () => {
        try {
        
            const response = await fetch(`${VITE_API_BASE_URL}/api/articles` ,
                { method: 'GET',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  credentials: 'omit' // Include cookies for authentication
                }
            );
            const data = await response.json();
            setArticles(data);
        } catch (error) {
            setError(error.message);
        }
    };

    useEffect(() => {
        fetchArticles();
    }, []);

    useEffect(() => {
        console.log(articles);
    }
    , [articles]);

    return (
        <>
            hellooooo
        </>
    );
}
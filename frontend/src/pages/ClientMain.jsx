import Header from "../components/Header"
import { useEffect, useState , useMemo } from "react"
import instance from "../api/axios"

const ClientMain = () => {


    /*
    NOTE :  
    this is to be fixed here i am sending this explicitly , Sachin fix this according to your auth logic.
        whatever user is loging in using authentication we just need to fetch their project._id that is the weddingId
        and pass it as a state or whatever is suitable save it somewhere as a local storage or cookie and pass it
        here.
        Rest i have mostly modularised the code and it is working as intended so you can use state management using
        redux if you want.
    */

    //////////////////////////////////////////////////////////////////
    // const weddingId = "6884b6791033db2946746dfa"; // fix this
    ///////////////////////////////////////////////////////////////////
    // for now keeping this as the response structure will fix this afterwards.

    const [weddingId,]  = useState(()=>{

        try{

            const userString = localStorage.getItem('user');
            if(!userString){
                return "some defult value."
            }
            const userObject = JSON.parse(userString);
            if(userObject.user && userObject.user.weddingId){
                return userObject.user.weddingId;
            }else{
                return "Default Value";
            }
        }catch(error){
            console.error("Local Storage Error : " , error);
            return "Default Value";
        }
    })
    
    const [categoryDetails, setCategoryDetails] = useState({
        "success": true,
        "data": [
            {
                "categoryId": "1",
                "categoryTitle": "No Images. Looks Shit I know need to be changed",
                "images": [
                    {
                        "_id": "1",
                        "url": "../../public/image.jpg",
                        "originalName": "no image",
                        "key": "",
                        "size": 100,
                        "uploadedAt": "2025-07-13T18:17:28.000Z"
                    }
                ],
                "categoryThreshold": 50
            },
        ]
    })

    const [unlockedIndexes, setUnlockedIndexes] = useState([0]);
    const [clickedImagesTracker, setClickedImagesTracker] = useState(Array(categoryDetails.data.length).fill(0));

    useEffect(() => {
        let newUnlocked = [0];
        for (let i = 0; i < categoryDetails.data.length - 1; i++) {
            if (clickedImagesTracker[i] >= categoryDetails.data[i].categoryThreshold) {
                newUnlocked.push(i + 1);
            } else {
                break;
            }
        }
        setUnlockedIndexes(newUnlocked);
    }, [clickedImagesTracker, categoryDetails.data]);



    useEffect(() => {

        async function FetchImages() {
            const response = await instance.post('/api/v1/user/fetch_presigned_urls', {
                weddingId
            })
            console.log(response.data);
            setCategoryDetails(response.data);
        }
        const user = localStorage.getItem('user');
        const user2 = JSON.parse(user);
        console.log(user2.user.weddingId);

        FetchImages();
    }, [])

    // Memoize the callback per index so its reference is stable for each PhotoGridUnlocked
    const handleClickedLengthChangeMap = useMemo(() => {
        return categoryDetails.data.map((_, idx) =>
            (clickedLength) => {
                setClickedImagesTracker(prev => {
                    const updated = [...prev];
                    updated[idx] = clickedLength;
                    return updated;
                });
            }
        );
    }, [categoryDetails.data]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-orange-50">
            <Header
                showTimer={true}
                userName="DESHANT MEMARA"
                notificationCount={2}
            />
            <main className="max-w-[1400px] mx-auto py-4 md:py-8 px-4 md:px-8">
                {categoryDetails.data.map((category, idx) => (
                    <PhotoGridUnlocked
                        key={idx}
                        category={category}
                        gridUnlock={unlockedIndexes.includes(idx)}
                        changeInClickedLength={handleClickedLengthChangeMap[idx]}
                    />
                ))}
            </main>
        </div>
    );
}

const PhotoGridUnlocked = ({ category, gridUnlock, changeInClickedLength }) => {

    const totalImages = category.images.length;
    const [clickedLength, setClickedLength] = useState(0);

    useEffect(() => {
        changeInClickedLength(clickedLength);
    }, [clickedLength,changeInClickedLength]);


    return (

        // PhotoGrid lock and unlock logic


        gridUnlock ?

        // Photo Grid Unlocked Loigc

            <div className="mb-8 md:mb-16 px-4 md:px-8 py-4 md:py-6 bg-white rounded-3xl shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 md:mb-8 gap-4">
                    <h1 className="text-4xl md:text-7xl font-light tracking-wider">{category.categoryTitle}</h1>

                    <div className="flex flex-wrap items-center gap-2 md:gap-3">
                        <button className="flex items-center gap-2 bg-gray-100 text-gray-700 hover:bg-gray-200 px-3 md:px-4 py-2 rounded-full transition-colors">
                            <svg className="w-4 md:w-5 h-4 md:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </button>
                        <button className="flex items-center gap-2 bg-purple-100 text-purple-700 hover:bg-purple-200 px-4 md:px-6 py-2 rounded-full transition-colors text-sm md:text-base">
                            SELECT PC
                        </button>
                        <button className="flex items-center gap-2 bg-purple-100 text-purple-700 hover:bg-purple-200 px-4 md:px-6 py-2 rounded-full transition-colors text-sm md:text-base">
                            <span>REPLACE</span>
                            <svg className="w-3 md:w-4 h-3 md:h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 md:gap-4">
                    {
                        category.images.map((image) => {
                            return <PhotoItem
                                key={image._id}
                                imageURL={image.url}
                                imageName={image.originalName}
                                onToggle={isSelected => setClickedLength(prev => isSelected ? prev + 1 : prev - 1)}
                                locked={false}
                            />
                        })
                    }
                </div>

                <div className="mt-4 md:mt-6 text-right text-xs md:text-sm text-gray-600">
                    Selected: {clickedLength}/{totalImages}
                </div>
            </div>

            : 
            // Photo Grid Locked Component
            <div className="mb-8 md:mb-16 px-4 md:px-8 py-4 md:py-6 bg-white rounded-3xl shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 md:mb-8 gap-4">
                    <h1 className="text-4xl md:text-7xl font-light tracking-wider text-gray-400">{category.categoryTitle}</h1>

                    <div className="flex flex-wrap items-center gap-2 md:gap-3">
                        <button className="flex items-center gap-2 bg-gray-50 text-gray-400 px-3 md:px-4 py-2 rounded-full transition-colors" disabled>
                            <svg className="w-4 md:w-5 h-4 md:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                        </button>
                        <button className="flex items-center gap-2 bg-purple-50 text-purple-300 px-4 md:px-6 py-2 rounded-full transition-colors text-sm md:text-base" disabled>SELECT PC</button>
                        <button className="flex items-center gap-2 bg-purple-50 text-purple-300 px-4 md:px-6 py-2 rounded-full transition-colors text-sm md:text-base" disabled>
                            <span>REPLACE</span>
                            <svg className="w-3 md:w-4 h-3 md:h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 md:gap-4">
                    {
                        category.images.map((image) => {
                            return <PhotoItem
                                key={image._id}
                                imageURL={image.url}
                                imageName={image.originalName}
                                onToggle={isSelected => setClickedLength(prev => isSelected ? prev + 1 : prev - 1)}
                                locked={true}
                            />
                        })
                    }
                </div>

                <div className="mt-4 md:mt-6 text-right text-xs md:text-sm text-gray-400">
                    <div className="flex items-center justify-end gap-2 text-gray-400">
                        <svg className="w-3 md:w-4 h-3 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8V7a4 4 0 00-8 0v4h8z" /></svg>
                        <span>Complete previous section to unlock</span>
                    </div>
                </div>
            </div>
    )

}



// i have modularised the states for images as three states : default , selected , locked

const PhotoItem = ({ imageURL, imageName, locked, onToggle }) => {

    const [clicked, setClicked] = useState(false);

    if (locked) {
        return <PhotoItemLocked imageURL={imageURL} imageName={imageName} />;
    }

    return (
        <div onClick={
            () => {
                setClicked((prev) => {
                    const newState = !prev;
                    if (onToggle) onToggle(newState);
                    return newState;
                })
            }
        }
        >
            {clicked ? <PhotoItemSelected imageURL={imageURL} imageName={imageName} /> : <PhotoItemDefault imageURL={imageURL} imageName={imageName} />}
        </div>
    )

}

const PhotoItemDefault = ({ imageURL, imageName }) => {
    return (
        <div className="relative aspect-square cursor-pointer group">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-pink-200 via-purple-200 to-blue-200 p-[2px] transition-opacity duration-200 opacity-40">
                <div className="absolute inset-[1px] bg-white rounded-[10px]"></div>
            </div>
            <div className="relative h-full rounded-xl overflow-hidden">
                <img src={imageURL} alt={imageName} className="w-full h-full object-cover transition-all duration-200 hover:scale-105" />
            </div>
        </div>
    )
}

const PhotoItemSelected = ({ imageURL, imageName }) => {

    return (
        <div className="relative aspect-square cursor-pointer group">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-pink-200 via-purple-200 to-blue-200 p-[2px] transition-opacity duration-200 opacity-100">
                <div className="absolute inset-[1px] bg-white rounded-[10px]"></div>
            </div>
            <div className="relative h-full rounded-xl overflow-hidden">
                <img src={imageURL} alt={imageName} className="w-full h-full object-cover transition-all duration-200 hover:scale-105 brightness-90" />
                <div className="absolute bottom-2 right-2">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                    </div>

                </div>
            </div>
        </div>
    )

}

const PhotoItemLocked = ({ imageURL, imageName }) => {
    return (
        <div className="relative aspect-square group">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-pink-200 via-purple-200 to-blue-200 p-[2px] transition-opacity duration-200 opacity-40">
                <div className="absolute inset-[1px] bg-white rounded-[10px]"></div>
            </div>
            <div className="relative h-full rounded-xl overflow-hidden">
                <img src={imageURL} alt={imageName} className="w-full h-full object-cover transition-all duration-200 brightness-50" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-10 h-10 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    )
}

// didn't get what is the use for this, this was in oves's frontend logic so kept it here use it accordingly.
const FloatingActionButton = () => {
    return (
        <div className="fixed bottom-4 md:bottom-8 left-1/2 transform -translate-x-1/2">
            <button className="bg-green-500 text-white rounded-full p-3 md:p-4 shadow-2xl hover:bg-green-600 transition-all duration-300 hover:scale-110">
                <svg className="w-6 md:w-8 h-6 md:h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
            </button>
        </div>
    )
}

export default ClientMain;
import Head from "next/head";
import { doc, DocumentData, DocumentSnapshot, getFirestore, setDoc } from "firebase/firestore";
import { useDocument } from "react-firebase-hooks/firestore";
import { signInWithPopup, GoogleAuthProvider, getAuth } from "firebase/auth";
import firebaseApp from "~/utils/firebaseApp";
import { useState, useEffect, useCallback } from "react";

function useDebounce(value: boolean, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

function FlagAnimation() {
  const [currentFlagIndex, setCurrentFlagIndex] = useState(0);
  const [isColoring, setIsColoring] = useState(true);
  const [coloredFlags, setColoredFlags] = useState<number[]>([]);

  const flags = [
    { country: "Россия", emoji: "🇷🇺" },
    { country: "США", emoji: "🇺🇸" },
    { country: "Германия", emoji: "🇩🇪" },
    { country: "Франция", emoji: "🇫🇷" },
    { country: "Япония", emoji: "🇯🇵" },
    { country: "Великобритания", emoji: "🇬🇧" },
    { country: "Италия", emoji: "🇮🇹" },
    { country: "Испания", emoji: "🇪🇸" },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      if (isColoring) {
        if (currentFlagIndex < flags.length) {
          setColoredFlags(prev => [...prev, currentFlagIndex]);
          setCurrentFlagIndex(prev => prev + 1);
        } else {
          setTimeout(() => {
            setIsColoring(false);
            setCurrentFlagIndex(0);
          }, 100);
        }
      } else {
        if (currentFlagIndex < flags.length) {
          setColoredFlags(prev => prev.filter(i => i !== currentFlagIndex));
          setCurrentFlagIndex(prev => prev + 1);
        } else {
          setIsColoring(true);
          setCurrentFlagIndex(0);
        }
      }
    }, 100);

    return () => clearInterval(interval);
  }, [currentFlagIndex, isColoring, flags.length]);

  return (
    <div className="flex flex-col h-[calc(80vh-400px)] justify-center items-center gap-6">
      <div className="flex gap-4 flex-wrap justify-center">
        {flags.map((flag, index) => (
          <div
            key={index}
            className={`text-4xl emoji transition-all duration-300 ease-in-out ${
              coloredFlags.includes(index) 
                ? 'opacity-100' 
                : 'opacity-80'
            }`}
            style={{
              filter: coloredFlags.includes(index) 
                ? 'none' 
                : 'brightness(0.3) saturate(0) contrast(200%)',
            }}
          >
            {flag.emoji}
          </div>
        ))}
      </div>
    </div>
  );
}

function LoadingPage() {
  return (
    <>
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
          <FlagAnimation />
        </div>
    </>
  );
}

function TimetablePage(props: { document: DocumentSnapshot<DocumentData> }) {
  const cols = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
  const rows = [
    "9:00",
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
    "18:00",
  ];

  let auth = getAuth(firebaseApp);

  const rawvalues = props.document.data()?.times;

  const values = new Array(cols.length * rows.length)
    .fill(0)
    .map((_, i) => Number(rawvalues[i] || 0));

  return (
    <>
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
          <h1 className="text-center text-2xl font-semibold leading-normal">
            Выберите удобное вам время
          </h1>
          <div className="grid grid-cols-8 gap-2">
            {new Array((cols.length + 1) * (rows.length + 1))
              .fill(0)
              .map((_, i) => {
                if (i < cols.length + 1)
                  return (
                    <span className="text-center" key={i}>
                      {cols[i - 1]}
                    </span>
                  );
                else if ((i / (cols.length + 1.0)) % 1 === 0)
                  return (
                    <span className="text-center mt-1" key={i}>
                      {rows[i / (cols.length + 1.0) - 1]}
                    </span>
                  );

                const n =
                  i -
                  (cols.length + 1) -
                  Math.floor(i / (cols.length + 1)) / (0 + 1);

                const value = values[n] || 0;

                return (
                  <Slot
                    key={i}
                    n={n}
                    value={value}
                    onClick={auth.currentUser ? () => {
                      let newvalues = (rawvalues + "")
                        .split("")
                        .map((v, i) => {
                          if (i !== n) return v;
                          return (Number(v) + 1) % 3;
                        })
                        .join("");
                      setDoc(
                        doc(getFirestore(firebaseApp), "config", "times"),
                        {
                          times: newvalues,
                        }
                      ).catch(() => {});
                    } : undefined}
                  />
                );
              })}
          </div>
        {auth.currentUser ? (
          ""
        ) : (
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded-md"
            onClick={() => {
              signInWithPopup(auth, new GoogleAuthProvider());
            }}
          >
            Редактировать
          </button>
        )}
        </div>
      
    </>
  );
}

function Slot(params: { value: number; n: number; onClick?: () => void }) {
  return (
    <div
      className={
        `${params.onClick ? "cursor-pointer" : ""} rounded-lg border border-gray-200 px-6 py-4 transition-all duration-300 ease-in-out` +
        (params.value === 0
          ? " bg-gray-100"
          : params.value === 1
          ? " bg-green-500"
          : " bg-red-300")
      }
      onClick={params.onClick}
    />
  );
}

export default function Home() {
  const [document, loading] = useDocument(
    doc(getFirestore(firebaseApp), "config", "times")
  );
  const [showContent, setShowContent] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const debouncedLoading = useDebounce(loading, 100);

  useEffect(() => {
    if (!debouncedLoading && document) {
      setIsTransitioning(true);
      const timer = setTimeout(() => {
        setShowContent(true);
        setIsTransitioning(false);
      }, 300);
      return () => clearTimeout(timer);
    } else {
    }
  }, [debouncedLoading]);

  let content = <LoadingPage />;
  if (document && !debouncedLoading && !isTransitioning && showContent) {
    content = <TimetablePage document={document} />;
  }

  return (
    <TransitionComponent showContent={!isTransitioning}>
      {content}
    </TransitionComponent>
  );
}

function TransitionComponent(props: { children: React.ReactNode, showContent: boolean }) {
  return (
    <>
      <Head>
        <title>Календарь</title>
        <meta name="description" content="Выберите удобное вам время" />
        <style>
          {`
            @import url('https://fonts.googleapis.com/css2?family=Noto+Color+Emoji&family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap');
          `}
        </style>
      </Head>
      <main className="flex flex-col items-center md:mt-6 bg-white">
        <div className={`transition-opacity duration-500 ease-in-out ${props.showContent ? 'opacity-100' : 'opacity-0'}`}>
          {props.children}
        </div>
      </main>
    </>
  );
}
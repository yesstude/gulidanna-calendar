import Head from "next/head";
import { doc, getFirestore, setDoc } from "firebase/firestore";
import { useDocument } from "react-firebase-hooks/firestore";
import { signInWithPopup, GoogleAuthProvider, getAuth } from "firebase/auth";
import firebaseApp from "~/utils/firebaseApp";

export default function Home() {
  const cols = ["Пн", "Вт", "Ср", "Чт"];
  const rows = [
    "9:00 - 9:40",
    "9:50 - 10:30",
    "10:40 - 11:20",
    "11:30 - 12:10",
    "12:20 - 13:00",
    "13:10 - 13:50",
    "14:00 - 14:40",
    "14:50 - 15:30",
    "15:40 - 16:20",
    "16:30 - 17:10",
    "17:20 - 18:00",
    "18:10 - 18:50",
  ];

  let auth = getAuth(firebaseApp);

  const [document, loading] = useDocument(
    doc(getFirestore(firebaseApp), "config", "times")
  );

  const rawvalues = loading ? "" : document?.data()?.times;

  const values = new Array(cols.length * rows.length)
    .fill(false)
    .map((_, i) => Boolean(Number(rawvalues[i] || 0)));

  return (
    <>
      <Head>
        <title>Календарь</title>
        <meta name="description" content="Выберите удобное вам время" />
        {/* <link rel="icon" href="/favicon.ico" /> */}
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center bg-white">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
          <h1 className="text-center text-2xl font-semibold leading-normal">
            Выберите удобное вам время
          </h1>
          <div className="grid grid-cols-5 gap-2">
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
                    <span className="text-center" key={i}>
                      {rows[i / (cols.length + 1.0) - 1]}
                    </span>
                  );

                const n =
                  i -
                  (cols.length + 1) -
                  Math.floor(i / (cols.length + 1)) / (0 + 1);

                const value = values[n] || false;

                return (
                  <Slot
                    key={i}
                    n={n}
                    enabled={value}
                    onClick={() => {
                      let newvalues = (rawvalues + "")
                        .split("")
                        .map((v, i) => {
                          if (i !== n) return v;
                          return value ? 0 : 1;
                        })
                        .join("");
                      setDoc(
                        doc(getFirestore(firebaseApp), "config", "times"),
                        {
                          times: newvalues,
                        }
                      ).catch(() => {});
                    }}
                  />
                );
              })}
          </div>
        </div>
        {auth.currentUser ? (
          ""
        ) : (
          <button
            onClick={() => {
              signInWithPopup(auth, new GoogleAuthProvider());
            }}
          >
            Редактировать
          </button>
        )}
      </main>
    </>
  );
}

function Slot(params: { enabled: boolean; n: number; onClick: () => void }) {
  return (
    <div
      className={
        `cursor-pointer rounded-lg border border-gray-200 px-6 py-4 transition-all` +
        (params.enabled
          ? " bg-white shadow hover:-translate-y-1 hover:shadow-lg"
          : " bg-gray-100")
      }
      onClick={params.onClick}
    />
  );
}

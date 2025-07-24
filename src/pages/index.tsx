import Head from "next/head";
import { doc, getFirestore, setDoc } from "firebase/firestore";
import { useDocument } from "react-firebase-hooks/firestore";
import { signInWithPopup, GoogleAuthProvider, getAuth } from "firebase/auth";
import firebaseApp from "~/utils/firebaseApp";

export default function Home() {
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

  const [document, loading] = useDocument(
    doc(getFirestore(firebaseApp), "config", "times")
  );

  const rawvalues = loading ? "" : document?.data()?.times;

  const values = new Array(cols.length * rows.length)
    .fill(0)
    .map((_, i) => Number(rawvalues[i] || 0));

  return (
    <>
      <Head>
        <title>Календарь</title>
        <meta name="description" content="Выберите удобное вам время" />
        {/* <link rel="icon" href="/favicon.ico" /> */}
      </Head>
      <main className="flex flex-col items-center mt-12 bg-white">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
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

function Slot(params: { value: number; n: number; onClick?: () => void }) {
  return (
    <div
      className={
        `${params.onClick ? "cursor-pointer" : ""} rounded-lg border border-gray-200 px-6 py-4 transition-all` +
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

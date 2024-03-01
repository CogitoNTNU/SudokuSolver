'use client'
import Camera from "./components/Camera/Camera";
import styles from "./page.module.scss"; 

export default function Home() {
    

    return (
        <main className={styles.main}>
            <Camera />
        </main>
    )
}

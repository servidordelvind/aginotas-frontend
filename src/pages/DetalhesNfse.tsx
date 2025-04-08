import { useParams } from "react-router-dom";


export function DetalhesNfse() {
    const { id } = useParams<{ id: string }>();

    return(
        <>
        <h1>{id}</h1>
        </>
    )
}
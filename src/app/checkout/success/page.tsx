import { Suspense } from "react";
import SuccessContent from './success-content';

export default function SuccessPage() {
    return(
        <Suspense fallback={<div>...Loading</div>}>
            <SuccessContent />
        </Suspense>
    );
}
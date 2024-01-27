import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import IconButton from "../../../common/IconButton"
import { useNavigate } from 'react-router-dom';
import { buyCourse } from '../../../../services/operations/studentFeaturesAPI';

const RenderTotalAmount = () => {

    const {total, cart} = useSelector((state) => state.cart);
    const { token } = useSelector((state) => state.auth);
    const { user } = useSelector((state) => state.profile);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleBuyCourse = () => {
       const courses = cart.map((course) => course._id)
       buyCourse(token, courses, user, navigate, dispatch);
    }

  return (
    <div className='flex min-w-[280px] rounded-md border-[1px] border-richblack-700 bg-richblack-800 p-6'>
      
        <p className='mb-1 text-sm font-medium text-richblack-300'>Total:</p>
        <p className='mb-6 text-sm font-semibold text-yellow-100'>Rs {total}</p>

        <IconButton

            text="Buy Now"
            onClick={handleBuyCourse}
            customClasses="w-full justify-center"
        />

    </div>
  )
}

export default RenderTotalAmount
